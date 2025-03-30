import db from "../db.js";

const getVariants = async (req, res) => {
    try{
        const query = "SELECT * FROM Variant";
        
        const [rows, field] = await db.execute(query)

        res.status(200).json(rows);

    }catch(error){
        res.status(404).json({ success: false, message: error.message });
    }
}

const getVariantsByProductID = async (req, res) => {
    try {
        const { id } = req.params; // Get ProductID from request parameters

        const query = "SELECT * FROM Variant WHERE ProductID = ?";   
        const [variants] = await db.execute(query, [id]);

        if (variants.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        res.status(200).json({ success: true, data: variants });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export {getVariantsByProductID, getVariants};