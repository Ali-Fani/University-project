const express = require('express');
const cors = require('cors');
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const app = express();
const path = require('path')

const {readFileSync,existsSync, writeFileSync,} = require('fs');
// parse json request body
app.use(express.json());
// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());
app.options('*', cors());

app.post('/',(req,res)=>{
    console.log(req)
    res.json({resp:"hello world"})
})

const crypto = require('crypto')





app.post("/upload_files", upload.single("file"), uploadFiles);

async function uploadFiles(req, res) {
    console.log(req.body);
    console.log(req.file);
    const algorithm = 'aes-256-gcm'
    const iv = crypto.randomBytes(16)
    console.log(iv)
    const salt = crypto.randomBytes(64)
    const key = crypto.pbkdf2Sync(req.body.password,salt,3000,32,'sha512');
    console.log(key)

    const cipher = crypto.createCipheriv(algorithm,key,iv);
    const encrypted = Buffer.concat([cipher.update(req.file.buffer),cipher.final()]);
    const tag = cipher.getAuthTag();
    const encrypted2 = Buffer.concat([salt,iv,tag,encrypted]);
    const filename = crypto.createHash('md5').update(req.file.originalname + Date.now).digest('hex')
    writeFileSync(path.join('uploads/',filename),encrypted2);
    res.json({ message: "Successfully uploaded files" });
}

app.get("/upload_files/:id",(req,res)=>{
    let pat=path.join('uploads/', req.params.id)
    console.log(req.query.password)
    if(existsSync(pat)){
        const file = readFileSync(path.join('uploads/', req.params.id));
        console.log(file.length)
        const algorithm = 'aes-256-gcm'
        const salt = file.subarray(0,64);
        const iv = file.subarray(64,80);
        const tag = file.subarray(80,96);
        const data = file.subarray(96)
        console.log(iv)
        const key = crypto.pbkdf2Sync(req.query.password,salt,3000,32,'sha512');
        console.log(key)
        const decipher = crypto.createDecipheriv(algorithm,key,iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(data),decipher.final()]);
        console.log(decrypted.length)
        let filename = 'test.pdf'
        res.header('Content-Type','')
        // res.charset()
        res.header('Content-Type','application/octet-stream')
        res.setHeader('Content-Disposition',`attachment;filename="${filename}"`)
        res.send(decrypted)
        // res.download(pat)
    }
})

module.exports = app;
