
import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    date:{
        type: Date,
        default: Date.now,
    },
    content:{
        type: String,
        required: true,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'user',
        }
    ]
},
{
    timestamps: true,
})
const postModel = mongoose.model('post', postSchema);

export default postModel;