import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
    try {
        console.log(req.headers)
        const token = req.headers.authorization.split(' ')[1];
        console.log(token)
        // const isCustomAuth = token.length < 500; //if token length > 500, that is google auth

        let decodedData;

        decodedData = jwt.verify(token, "test")

        req.userId = decodedData?.id
        console.log(decodedData.id)

        // if(token && isCustomAuth) {
            // decodedData = jwt.verify(token, "test")

            // req.userId = decodedData?.id
            // console.log(decodedData.id)
        // } else {
        //     decodedData = jwt.decode(token)

        //     req.userId = decodedData?.sub
        //     console.log(decodedData.sub)
        // }

        next(); //after this do next thing

    } catch (err) {
        console.error(err);
    }
}

export default auth;