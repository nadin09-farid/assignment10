import multer from "multer";

const storage = multer.diskStorage({

    destination: function(req,file,cb) {
        cb(null,"uploads/");
    },

    filename: function(req,file,cb) {
        cb(null,Date.now()+"-"+file.originalname);
    }

});

const fileFilter = (req,file,cb)=>{

    if(file.mimetype.startsWith("image")){
        cb(null,true);
    }else{
        cb(new Error("Only images allowed"),false);
    }

};

export const upload = multer({
    storage,
    fileFilter
});