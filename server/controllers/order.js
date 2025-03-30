import nodemailer from "nodemailer";

function formatRupiah(price) {
    // Convert to fixed 3 decimal places
    let formattedPrice = parseFloat(price).toFixed(3);
    
    // Replace thousand separator (, → .)
    return formattedPrice;
}

const sendOrderEmail = async (req, res) => {
    try {
        const { cartItems, user, totalPrice } = req.body;

        if (cartItems.length === 0 || !user || !totalPrice) {
            return res.status(400).json({ message: "Invalid order data" });
        }

        // Format the product details into a readable email
        let cartItemsList = cartItems.map((item, index) => 
            `${index + 1}. ${item.Title} ${item.Variant ? `(${item.Variant})` : ""}- ${item.Quantity} pcs - Rp. ${formatRupiah(item.Price * item.Quantity)}`
        ).join("\n");

        const emailText = `
        📦 Pesanan Baru Diterima!
        ==========================
        🛍️ Dipesan oleh:
        Email: ${user?.Email}
        Nama: ${user?.FullName}
        Nomor HP: ${user?.PhoneNumber}
        Negara: ${user?.Country}
        Kota: ${user?.City}
        Alamat: ${user?.Address}
        Postal Code: ${user?.PostalCode}

        🛒 Detail Pesanan:
        ${cartItemsList}

        💰 Total Harga: Rp. ${formatRupiah(totalPrice)}
        ==========================
        Terima Kasih! 🙏`;

        // Configure mail transporter
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "frozeneverydayhelper@gmail.com", // Your Gmail
                pass: "siko kkrc xpec guye", // App password (not your real password)
            },
        });

        // Email options
        let mailOptions = {
            from: "frozeneverydayhelper@gmail.com",
            to: "Everydayfrozen@gmail.com",
            subject: "Pesanan Baru Diterima",
            text: emailText,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Email pesanan berhasil terkirim!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
};

export { sendOrderEmail };
