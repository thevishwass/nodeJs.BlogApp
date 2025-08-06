import express from 'express';
import cookieParser from 'cookie-parser';
import userModel from './models/user.js';
import postModel from './models/post.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import methodOverride from 'method-override';


const app = express();
const port = 3000;

app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.get('/', (req, res) => {
    res.render("homepage");
});

app.get('/profile', isLoggedIn, async (req, res) => {
    let user = await userModel
    .findOne({emailId: req.user.emailId})
    .populate("posts");
    
    res.render("profile", {user});
})

app.get('/logout', (req, res)=> {
    res.cookie("token", "");
    res.redirect('/login');
})

app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/signup', async (req, res) => {
    let {name, username, emailId, password, age} = req.body;
    let user = await userModel.findOne({emailId});

    if(user) return res.status(500).send("user already registered.");

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            const user = await userModel.create({
                name,
                username,
                age,
                emailId,
                password: hash,

            })
            let token = jwt.sign({emailId: emailId, userId: user._id}, "hello");
            res.cookie("token", token);
            res.redirect("/login");
        })
        })
});

app.post('/login', async (req, res) =>{
    let {emailId, password} = req.body;
    let user = await userModel.findOne({emailId});

    if(!user) return res.status(500).send("User not found with this email");
    
    bcrypt.compare(password, user.password, (err, result) => {
        if(result){
            let token = jwt.sign({emailId: emailId, userId: user._id}, "hello");
            res.cookie("token", token);
            return res.status(200).redirect('/profile');

        } 
        else{
            res.redirect('/login');
            
        }
    })


})

app.post('/post', isLoggedIn, async (req, res) =>{
    
    let user = await userModel.findOne({emailId: req.user.emailId});
    let {content} = req.body;
    let post = await postModel.create({
        user: user._id,
        content,
    })
    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile');
})

app.get('/like/:id', isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({_id: req.params.id}).populate('user');
    if (post.likes.indexOf(req.user.userId) === -1){
        post.likes.push(req.user.userId);
    } else{
        post.likes.splice(post.likes.indexOf(req.user.userId), 1);
    }
    await post.save();
    res.redirect('/profile');
});

app.get('/edit/:id', isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({_id: req.params.id}).populate('user')
    res.render('editPage', {post});
});


app.post('/update/:id', isLoggedIn, async (req, res) => {
    let post = await postModel.findOneAndUpdate({_id: req.params.id}, {content: req.body.content});
    res.redirect('/profile');
})

app.delete('/delete/:id', isLoggedIn, async (req, res) => {
    await postModel.findOneAndDelete({_id: req.params.id});
    res.redirect('/profile');
})


app.get('/signup', (req, res) => {
    res.render("signup");
});

function isLoggedIn(req, res, next){
    if(req.cookies.token === ""){
        res.render("noLogin");
    } else{
        let data = jwt.verify(req.cookies.token, "hello");
        req.user = data;
    }
    next();
}



app.listen(port, () => {
    console.log("Listening on port - http://localhost:"+port);
})