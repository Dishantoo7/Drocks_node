require('dotenv').config()
const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const cryptoJs=require('crypto-js');
const cors=require('cors');
const nodeMailer=require('nodemailer');
const jwt=require('jsonwebtoken');
const fileUpload = require('express-fileupload');

const User=require('./Mongo');


const app=express();
const path=require('path')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.use(fileUpload());


app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json())
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
app.use(bodyParser.text({ type: 'text/html' }))

app.use(function(req, res, next) {
    res.setHeader('Content-Type', 'text/plain');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});


mongoose.connect('mongodb://localhost:27017/myapp',{ useNewUrlParser: true, useUnifiedTopology: true } 
        ,()=>{
          console.log("Connected With Mongodb");  
        }
);
mongoose.set('useCreateIndex', true);



var dir = path.join(__dirname, 'public');
app.use(express.static(dir));
console.log(dir);



app.post('/upload/:uid',(req,res)=>{

    if(req.files === null){
        return res.status(400).json(
            { 
                msg:'No Files Uploaded',
                status:false 
            }
        );
    }

    let file = req.files.file;
    // console.log(req.params.uid);

    const randomName=`IMAGE-${Date.now()}${path.extname(file.name)}`;
    file.mv(`${__dirname}/public/${randomName}`, err => {
        if(err){
            return res.status(500).send(err)
        }
        User.findByIdAndUpdate(req.params.uid , { profilePic:`${randomName}`} , { new :true } ,(err, data)=>{
            console.log(data)
        })
        res.status(200).json(
            { 
                filepath:`${randomName}`,
                status:true
            }
        )
    })
    
});


app.post('/register',(req,res)=>{
    const pass=cryptoJs.AES.encrypt(req.body.password,'DishantEmpire');
    const Userinfo= new User({ 

        username:req.body.username,
        email:req.body.email,
        number:req.body.number,
        password:pass,
        date:req.body.date

    });    
    
    Userinfo.save()
            .then(data=>{
                res.status(200).json({
                    status:true,
                    msg:'Successfully registerd'
                });
                const htmldata=` 
                <html> 
                <head> 
                    <title>Welcome to CodexWorld</title> 
                </head> 
                <body> 
                    <h1>Thanks you for joining with us!</h1> 
                    <table cellspacing="0" style="border: 2px dashed #FB4314; width: 100%;"> 
                        <tr> 
                            <th>Name:</th><td>${req.body.name}</td> 
                        </tr> 
                        <tr style="background-color: #e0e0e0;"> 
                            <th>Email:</th><td>${req.body.email}</td> 
                        </tr> 
                        <tr> 
                            <th>Website:</th><td><a href="http://www.DishantEmpire.com">www.DishantEmpire.com</a></td> 
                        </tr> 
                    </table> 
                </body> 
                </html>`
                /*const htmldata = `
                <div>255896040

                    <h3 style="color : black">Dear,</h3>
                    <p style="color : #6B6F82;font-size:16px;font-weight : 500;color:green">Registration Succsessfully Completed  </p>   
                    <span style="color : #6B6F82;font-size:14px;">Regards,</span><br/>
                    <span style="color : #6B6F82;font-size:14px;">Dishant Empire Support Team</span>
         
                </div>
                    `*/
                var transporter = nodeMailer.createTransport({
                    service: 'Gmail',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'dishantnavadiya585858@gmail.com',
                        pass: 'dharmik@123',
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });
                var mailOptions = {
                    from: '"Dishant  Navadiya" <dishantnavadiya585858@gmail.com>',
                    to: req.body.email,
                    subject: 'Welcome '+req.body.name,
                    text: 'Keep in touch',
                    html: htmldata
                };

                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            })
            .catch(err=>{
                console.log(err);
                res.status(400).send(err);
            }); 
});



app.get('/finduser/:_id',auth,(req,res)=>{
    //res.send('got it')
    const id=req.params._id; 
    
    User.findById({_id:id})
        .then(result=>{
            if(!result){
                res.send('Null');
            }
            res.status(200).send(result);
        })
        .catch(err=>{
            res.status(400).send(err);
        });
});


app.post('/signin',(req,res)=>{
    
    const {username,password}=req.body;
        User.find({ username })
            .then(data=>{
                if(data){
                    console.log(data)
                    const chkPass=cryptoJs.AES.decrypt(data[0].password,'DishantEmpire').toString(cryptoJs.enc.Utf8);
                    if(password===chkPass){
                        const Token=jwt.sign({_id:data[0]._id},'KK007');
                        res.json({
                            token:Token,
                            user:data[0]._id,
                            status:true 
                        })
                    }
                }else{
                    res.json({
                        status:false,
                        msg:'User Does not exits'
                    })
                }
            })
            .catch(err=>{
                res.send(err)
            })
})

app.post('/login',(req,res)=>{
    const email=req.body.email;
    const pass=req.body.password;
    if (!email){    
        res.json({
                    status:false,
                    msg:'Plz Enter valid details'
                });
    } else{
        User.findOne({
            email:email
        })
            .then(result=>{
                if(!result){
                    res.send("No User Found");
                }else{
                    const password=cryptoJs.AES.decrypt(result.password,'DishantEmpire').toString(cryptoJs.enc.Utf8);
                    if(pass==password){
                        const Token=jwt.sign({_id:result._id},'KK007');
                        //res.header('auth-token',Token).send(Token);
                        res.json({
                            status:true,
                            msg:Token
                        })
                    }else{
                        res.send('User does not exits');
                    }
                }
                
        })
            .catch(err=>{
                res.status(400).send(err);
            })    
        ;
    }

});


app.get('/qrcode',(req,res)=>{
    res.send("Hy");
});

function auth(req,res,next){
    const token =req.header('auth-token');
    if(!token){
         res.status(401).send("Access Denied");
    }
    try{
        const verified=jwt.verify(token,'KK0077');
        console.log(verified);
        req.user=verified;
        next();
    }catch(err){
        res.status(400).send('Invalid Token');
    }
}
app.use(auth);
app.get('/keval',(req,res)=>{
    res.send(req.user)
})

app.get('/showuser',auth,(req,res)=>{
    
    const UserResult=[];
    
    User.find()
        .then(result=>{
            var d;
            for(d=0;d<result.length;d++){
                let password=cryptoJs.AES.decrypt(result[d].password,'DishantEmpire').toString(cryptoJs.enc.Utf8);
                UserResult.push({name:result[d].name,email:result[d].email,number:result[d].number,password:password,date:result[d].date.toLocaleDateString()});
            }
            res.send(UserResult);
        })
        .catch(err=>{
            res.status(400).send(err);
        });
      
});

app.listen(4000,()=>{
    console.log("Server Is Running");
})
