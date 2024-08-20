import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    myFile: String
});
export default mongoose.models.posts || mongoose.model('post', postSchema)