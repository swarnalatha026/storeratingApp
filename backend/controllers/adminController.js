const db = require("../config/db");
// const { v4: uuidv4 } = require("uuid");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// Generate custom ID (nu123, sto123, stid123)
const generateCustomId = (prefix) => {
    return `${prefix}${Math.floor(100 + Math.random() * 900)}`;
};

/**
 * @desc Create Normal User or Store Owner
 * @route POST /admin/users
 */
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;

        if (!name || !email || !password || !address || !role) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (name.length < 20) {
            return res.status(400).json({ message: "Name must be at least 20 characters long." });
        }

        if (!["normal", "store_owner"].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified." });
        }

        // Generate user ID based on role
        const userId = role === "normal" ? generateCustomId("nu") : generateCustomId("sto");
        
        // await db.promise().query(
        //     "INSERT INTO users (id, name, email, password, address, role) VALUES (?, ?, ?, ?, ?, ?)",
        //     [userId, name, email, password, address, role]
        // );

        // res.status(201).json({
        //     message: "User created successfully.",
        //     user: { id: userId, name, role }
        // });
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await User.create(userId, name, email, hashedPassword, address, role);

        res.status(201).json({
            message: "User registered successfully.",
            user: { id: userId, name, email, role }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * @desc Create a Store (Assign to Store Owner)
 * @route POST /admin/stores
 */
exports.createStore = async (req, res) => {
    try {
        const { store_name, email, address, owner_email } = req.body;

        if (!store_name || !email || !address || !owner_email) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if owner exists and is a store_owner
        const [owner] = await db.promise().query("SELECT id FROM users WHERE email = ? AND role = 'store_owner'", [owner_email]);
        console.log("owner",owner[0].id);
        if (owner.length === 0) {
            return res.status(400).json({ message: "Invalid store owner ID." });
        }

        // Generate store ID
        const storeId = generateCustomId("stid");

        await db.promise().query(
            "INSERT INTO stores (id, name, email, address, owner_id) VALUES (?, ?, ?, ?, ?)",
            [storeId, store_name, email, address, owner[0].id]
        );

        res.status(201).json({
            message: "Store created successfully.",
            store: { id: storeId, name: store_name, owner_email }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * @desc View Admin Dashboard (Total Users, Stores, Ratings)
 * @route GET /admin/dashboard
 */
exports.getAdminDashboard = async (req, res) => {
    try {
        const [[usersCount]] = await db.promise().query("SELECT COUNT(*) AS total_users FROM users where id not in ('admin')");
        const [[storesCount]] = await db.promise().query("SELECT COUNT(*) AS total_stores FROM stores");
        // const [[ratingsCount]] = await db.promise().query("SELECT COUNT(*) AS total_ratings FROM ratings");
        const [[ratingsCount]] = await db.promise().query("SELECT SUM(JSON_LENGTH(ratings)) AS total_ratings FROM ratings");
        console.log("fetchAdminDashboard",{
            total_users: usersCount.total_users,
            total_stores: storesCount.total_stores,
            total_ratings: ratingsCount.total_ratings
        });
        res.status(200).json({
            total_users: usersCount.total_users,
            total_stores: storesCount.total_stores,
            total_ratings: ratingsCount.total_ratings
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.promise().query(`
            SELECT u.id, u.name, u.email, u.role, 
            CASE 
            WHEN u.role = 'store_owner' THEN COALESCE((
                SELECT AVG(rating_value)
                FROM ratings r
                JOIN stores s ON r.store_id = s.id
                JOIN JSON_TABLE(r.ratings, '$[*]' 
                COLUMNS (rating_value INT PATH '$.rating')) AS extracted_ratings
                WHERE s.owner_id = u.id
                ), 0) 
                ELSE NULL 
                END AS avg_rating
            FROM users u
            WHERE u.role != 'admin'
            ORDER BY u.created_at DESC
            `);
            
            res.status(200).json(users);
        } catch (error) {
            console.error("SQL Error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
};

/**
 * @desc Get List of Stores
 * @route GET /admin/stores
*/
// exports.getStores = async (req, res) => {
//     try {
//         const [stores] = await db.promise().query(`
//             SELECT s.id, s.name, s.address, s.owner_id, 
//             COALESCE((
//                 SELECT AVG(
//                     CAST(JSON_UNQUOTE(JSON_EXTRACT(r.ratings, '$[*].rating')) AS DECIMAL)
//                     ) FROM ratings r WHERE r.store_id = s.id
//                     ), 0) AS rating
//                     FROM stores s
//                     ORDER BY s.created_at DESC
//                     `);
                    
//                     res.status(200).json(stores);
                    
//         } catch (error) {
//         console.error("SQL Error:", error);
//         res.status(500).json({ message: "Internal server error." });
//     }
// };
exports.getStores = async (req, res) => {
    try {
        const [stores] = await db.promise().query(`
            SELECT s.id, s.name, s.address, s.owner_id, s.email, u.name AS owner_name,
    COALESCE((
        SELECT AVG(extracted_ratings.rating_value)
        FROM ratings r
        JOIN JSON_TABLE(
            r.ratings, '$[*]'
            COLUMNS (rating_value INT PATH '$.rating')
        ) AS extracted_ratings
        WHERE r.store_id = s.id
    ), 0) AS rating
FROM stores s
JOIN users u ON s.owner_id = u.id  -- Fetch owner's name from users table
ORDER BY s.created_at DESC;


        `);

        res.status(200).json(stores);
    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

                
                /*** @desc Get User Details
                 * @route GET /admin/users/:id
                */
               exports.getUserDetails = async (req, res) => {
                   try {
                       const userId = req.params.id;
                       const [[user]] = await db.promise().query("SELECT id, name, email, role FROM users WHERE id = ?", [userId]);
                       
                       if (!user) {
                           return res.status(404).json({ message: "User not found." });
                        }
                        
                        res.status(200).json(user);
                        
                    } catch (error) {
                        console.error(error);
                        res.status(500).json({ message: "Internal server error." });
                    }
};

exports.getAllRatings = async (req, res) => {
    try {
        const [rows] = await db.promise().query(`
            SELECT r.store_id, r.ratings, s.name AS store_name,s.email as store_email
            FROM ratings r
            JOIN stores s ON r.store_id = s.id
        `);

        const formattedRatings = rows.map((row) => ({
            store_id: row.store_id,
            store_name: row.store_name,
            store_email:row.store_email,
            ratings: typeof row.ratings === "string" ? JSON.parse(row.ratings) : row.ratings, // Parse only if string
        }));

        res.json(formattedRatings);
    } catch (error) {
        console.error("Error fetching ratings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// exports.getStores = async (req, res) => {
    //     try {
        //         const [stores] = await db.promise().query(
            //             "SELECT s.id, s.name, s.address, s.owner_id, COALESCE(AVG(r.rating), 0) AS rating FROM stores s " +
            //             "LEFT JOIN JSON_TABLE((SELECT ratings FROM ratings WHERE store_id = s.id), '$[*]' COLUMNS (rating INT PATH '$.rating')) AS r " +
            //             "GROUP BY s.id ORDER BY s.created_at DESC"
            //         );
            
            //         res.status(200).json(stores);
            
            //     } catch (error) {
                //         console.error(error);
                //         res.status(500).json({ message: "Internal server error." });
                //     }
                // };
                /**
                 * @desc Get List of Users
                 * @route GET /admin/users
                 */
                // exports.getUsers = async (req, res) => {
                //     try {
                //         const [users] = await db.promise().query(
                //             "SELECT id, name, email, role FROM users ORDER BY created_at DESC"
                //         );
                
                //         res.status(200).json(users);
                
                //     } catch (error) {
                //         console.error(error);
                //         res.status(500).json({ message: "Internal server error." });
                //     }
                // };