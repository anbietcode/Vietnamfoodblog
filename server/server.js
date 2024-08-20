import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import User from './Schema/User.js';
import Blog from './Schema/Blog.js';
// import model
import Post from './Schema/Post.js';
import Notification from './Schema/Notification.js';
import Comment from './Schema/Comment.js'

const server = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json({limit: '10000kb'}));
server.use(cors());


mongoose.connect(mongodb+srv://daotranthuyan:rxWMArElP5xZV8hm@reactjs-blogging-websit.sovdb.mongodb.net/?retryWrites=true&w=majority&appName=reactjs-blogging-website-yt, {
  autoIndex: true,
});


const verifyJWT = (req, res,next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1];

  if(token == null) {
    return res.status(401).json({ error: "No access token" })
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY,(err, user) => {
    if(err) {
      return res.status(403).json({error: "Access tokrn is invalid"})
    }
    req.user = user.id
    next()
  } )
}

const formatDataSend = (user)=> {

  const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY )

  return{
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,

  }
}

const generateUsername = async(email) => {
  let username = email.split("@")[0]; 

  let isUsernameNotUnique = await User.exists({ "personal_info.username": username }).then((result) => result)

  isUsernameNotUnique ? username += nanoid().substring(0, 5) : "";

  return username
}
//POST: signup
server.post("/signup", (req, res) => {
  let { fullname, email, password } = req.body;
  if(fullname.length < 3){
    return res.status(403).json({ "error": "Fullname must be at least 3 letters long" })
  }
  if(!email.length) {
    return res.status(403).json({ "error": "Enter Email" })
  }
  if(!emailRegex.test(email)){
    return res.status(403).json({ "error": "Email is invalid" })
  }
  if(!passwordRegex.test(password)){
    return res.status(403).json({ "error": "Password should be 6 to 20 characters long with a numberic, 1 lowercase and 1 uppercase letters"})
  }

  bcrypt.hash(password, 10, async (err, hashed_password)=> {
    let username = await generateUsername(email);

    let user = new User({
      personal_info: {fullname, email, password: hashed_password, username}
    })

    user.save().then((u) => {
      return res.status(200).json(formatDataSend(u))
  })
  .catch(err => {
    if(err.code == 11000){
      return res.status(500).json({ "error": "Email already exists" })
    }
  })

    console.log(hashed_password)
  })

 
});

//POST: signup
server.post("/signin", (req,res) => {
  let { email, password } = req.body;

  User.findOne({ "personal_info.email": email })
  .then((user) => {
    if(!user){
      return res.status(403).json({ "error": "Email not found" });
    }
    
    bcrypt.compare(password, user.personal_info.password, (err, result) => {

      if(err) {
        return res.status(403).json({ "error": "Error occured while login please try again" });
      }
      if(!result) {
        return res.status(403).json({ "error": "Incorrect password"})
      } else {
        return res.status(200).json(formatDataSend(user))
      }

    })

   
  })
  .catch(err => {
    console.log(err.message);
    return res.status(500).json({ "error": err.message })
  })
})

//POST: Upload Image
server.post("/editor", async(req,res) => {
  const body = req.body;
  try {
    const newImage = await Post.create(body)
    newImage.save();
    res.status(200).json({ mgs: "New Image upload...." })
  } catch(error) {
    res.status(500).json({ mgs: error.message })
  }
})

server.get('/latest-blogs', (req, res) => {

  let maxLimit = 10;

  Blog.find({ draft: false })
  .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id ")
  .sort({"publishedAt": -1 })
  .select("blog_id title des activity tags publishedAt -_id")
  .limit(maxLimit)
  .then(blogs => {
    return res.status(200).json({ blogs })
  })
  .catch(err => {
    return res.status(500).json({ error: err.message })
  })

})

server.get("/trending-blogs", (req,res)=> {
  Blog.find({ draft: false })
  .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id ")
  .sort({"activity.total_read": -1, "activity: total_likes": -1, "publishedAt": -1})
  .select("blog_id title publishedAt -_id")
  .limit(5)
  .then(blogs => {
    return res.status(200).json({ blogs })
  })
  .catch(err => {
    return res.status(500).json({ error: err.message })
  })

})

//User
server.post("/get-profile", (req,res) => {
  let {username} = req.body;
  User.findOne({"personal_info.username": username})
  .select("-personal_info.password -updatedAt -blogs")
  .then(user => {
    return res.status(200).json(user)
  })
  .catch(err => {
    console.log(err);
    return res.status(500).json({ error: err.message })
  })
})

server.post('/create-blog', verifyJWT, (req,res) => {

  let authorId = req.user;

  let { title, des, tags, content, draft, banner, id } = req.body;

  if(!title.length){
    return res.status(403).json({ error: "You must provide a title to publish the blog" });
  }

  if(!draft) {
    if(!des.length || des.length > 200){
      return res.status(403).json({ error: "You must provide blog description under 200 characters" });
    }
  
    if(!content.blocks.length){
      return res.status(403).json({error: "There must be some blog content to publish it"});
    }
  
    if(!tags.length || tags.length > 10){
      return res.status(403).json({error: "Provide tags in order to publish the blog, maximun 10 !"});
    }
  
  }
 
  tags = tags.map(tag => tag.toLowerCase());

  let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

  if(id) {
      
    Blog.findOneAndUpdate({ blog_id }, {title, des, content, tags, draft: draft ? draft: false })
    .then(() => {
      return res.status(200).json({ id: blog_id });
    }) 
    .catch(err => {
      return res.status(500).json({ error: "Failed to upload"})
    })
  } else {
    let blog = new Blog({
      title, des, content, tags, author: authorId, blog_id, draft: Boolean(draft)
    })
  
    blog.save().then(blog => {
      let incrementVal = draft ? 0 : 1;
  
      User.findOneAndUpdate({ _id: authorId }, { $inc : { "account_info.total_posts" : incrementVal }, $push: { "blogs": blog._id  }  })
      .then(user => {
        return res.status(200).json({ id: blog.blog_id })
      })
      .catch(err => {
        return res.status(500).json({ error: "Failed to upload"})
      })
    })
    .catch(err => {
      return res.status(500).json({ error: err.message })
    })
  }

})

server.post("/get-blog", (req,res) => {
  let { blog_id, draft, mode } = req.body;

  let incrementVal = mode != 'edit' ? 1 : 0;

  Blog.findOneAndUpdate({ blog_id}, {$inc: {"activity.total_reads": incrementVal } })
  .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
  .select("title des content banner activity publishedAt tags blog_id")
  .then(blog => {
    User.findOneAndUpdate({ "personal_info.username": blog.author.personal_info.username}, { $inc: { "account_info.total_reads": incrementVal}
    })
  .catch(err => { 
    return res.status(500).json({ error: err.message });
  })
  if(blog.draft && !draft) {
    return res.status(500).json({ error: 'You can not access draft blog' });
  }
  return res.status(200).json({ blog });
  })
  .catch(err => {
    return res.status(500).json({ error: err.message });
  })
})

//Search-blog
server.post("/search-blogs", (req, res) => {
  let { tag, query, author, page, limit, eliminate_blog } = req.body;
  let findQuery;

  if(tag){
  findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
  } else if(query) {
  findQuery = { draft: false, title: new RegExp(query, 'i')}
  } else if(author) {
  findQuery = { author, draft: false }
  } 

  let maxLimit = limit ? limit: 2 ;

  Blog.find(findQuery)
  .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id") 
  .sort({"publishedAt": 1 })
  .select("blog_id title des banner activity tags publishedAt -_id")
  .skip ((page - 1) * maxLimit)
  .limit(maxLimit)
  .then(blogs => {
    return res.status (200).json({ blogs })
  })
  .catch(err => {
    return res.status(500).json({ error: err.message })
  })
})

server.post("/like-blog", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id, islikeByUser } = req.body;
  let incrementVal = !islikeByUser ? 1: -1; 
  Blog.findOneAndUpdate({ _id}, {$inc: {"activity.total_likes" : incrementVal } })
  .then(blog => {
    if(!islikeByUser) {
      let like = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id
      })

      like.save().then(notification => {
        return res.status(200).json({ liked_by_user: true})
      })
    } else {
      Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
      .then(data => {
        return res.status(200).json( { liked_by_user: false})
      })
      .catch(err => {
        return res.status(500).json({ error: err.message })
      })
    }
  })
} )

server.post("/isliked-by-user", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { _id } = req.body ; 

  Notification.exists({ user: user_id, type: "like", blog: _id})
  .then(result => {
    return res.status(200).json({ result })
  })
  .catch(err => {
    return res.status(500).json( { error: err.message})
  })
})

server.post("/add-comment", verifyJWT, (req, res) => {

  let user_id = req.user;

  let { _id, comment,  blog_author, replying_to } = req.body;

  if(!comment.length) {
    return res.status(403).json({ error: "Write something to leave a comment" });
  }

  let commentObj = ({
    blog_id: _id, blog_author, comment, commented_by: user_id

  })
  if(replying_to) {
    commentObj.parent = replying_to;
  }
  new Comment(commentObj).save().then( async commentFile => {
    let {  comment, commentedAt, children } = commentFile;

    Blog.findOneAndUpdate({ _id}, {$push:  {"comments": commentFile._id}, $inc: {"activity.total_comments": 1 }, "activity.total_parent_comments": replying_to ? 0 :  1 })
    .then(blog => { console.log('New comment created') });
  
    let notificationObj = {
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id
    }

    if(replying_to){

      notificationObj.replied_on_comment = replying_to;
      await Comment.findOneAndUpdate({ _id: replying_to }, { $push: { children: commentFile._id }} )
      .then(replyingToCommentDoc => {
        notificationObj.notification_for = replyingToCommentDoc.commented_by
      })
    }

    new Notification(notificationObj).save(notification => console.log('new notification created'));

    return res.status(200).json({
      comment, commentedAt, _id: commentFile._id, user_id, children
    })

  })

})

server.post("/get-blog-comments", (req, res) => {

  let { blog_id, skip} = req.body;

  let maxLimit = 5;

  Comment.find({ blog_id, isReply: false  })
  .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img" )
  .skip(skip)
  .limit(maxLimit)
  .sort({
    'commentedAt' : -1
  })
  .then(comment => {
    return res.status(200).json(comment);
  })
  .catch(err => {
    console.log(err.message)
    return res.status(500).json({ error: err.message });
  })

})


server.listen(PORT, () => {
  console.log("listening on port ->" + PORT);
});
