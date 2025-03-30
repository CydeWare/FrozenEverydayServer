import db from "../db.js";

const getFiles = async (req, res) => {
    try{
        const query = "SELECT * FROM File";
        
        const [rows, field] = await db.execute(query)

        res.status(200).json(rows);

    }catch(error){
        res.status(404).json({ success: false, message: error.message });
    }
}

const getFirstFiles = async (req, res) => {
    try {
        const query = `
            SELECT * FROM File AS f
            WHERE FileID = (SELECT MIN(FileID) FROM File WHERE ProductID = f.ProductID)
        `;
        
        const [files] = await db.execute(query);

        console.log("Files: ", files);

        if (files.length === 0) {
            return res.status(404).json({ success: false, message: "No files found." });
        }

        res.status(200).json({ success: true, data: files });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getFilesByProductID = async (req, res) => {
    try {
        console.log("Parameters: ", req.params);
        const { id } = req.params; // Get ProductID from request parameters

        const query = "SELECT * FROM File WHERE ProductID = ?";   
        const [files] = await db.execute(query, [id]);

        if (files.length === 0) {
            return res.status(404).json({ success: false, message: "No files found for this product." });
        }

        res.status(200).json({ success: true, data: files });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




export {getFiles, getFirstFiles, getFilesByProductID};