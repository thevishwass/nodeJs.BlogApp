
import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/01-miniproject');

const UserSchema = mongoose.Schema({
    username: String,
    name: String,
    emailId : String,
    password: String,
    age: Number,
    posts: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'post'}, 
    ],


},
{
    timestamps: true
})

const UserModel = mongoose.model('user', UserSchema);

export default UserModel;