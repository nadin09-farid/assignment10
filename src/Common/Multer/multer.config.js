import multer from 'multer';
import {randomUUID} from 'node:crypto';
import path from "node:path";
import {existsSync , mkdirSync} from 'node:fs';

export const allowedFileFormats = {
    img : ['image/png' , 'image/jpg'],
    video : ['video/mp4'],
    pdf : ['application/pdf'],
};

export function localUpload({folderName = "GeneralFiles" , allowedFileFormat = allowedFileFormats.img}){
    const storage = multer.diskStorage({
        destination: function(req , file , cb){
            const fullPath = `./uploads/${folderName}`;

            if(!existsSync(fullPath)){
                mkdirSync(fullPath , {recursive : true});
            }

            cb(null , path.resolve(fullPath));

        },
        filename : function(req , file , cb){
            const fileName = randomUUID + '_' + file.originalname;
            cb(null , fileName);
        },
    });


    function fileFilter (req , file , cb){
        if(!allowedFileFormat.includes(file.mimetype)){
            return cb(
                new Error("Invalid Formate" , {cause : {statusCode : 400}}),
                false,
            );
        }

        return cb(null , true);
    }

    return multer({storage , fileFilter});
};
