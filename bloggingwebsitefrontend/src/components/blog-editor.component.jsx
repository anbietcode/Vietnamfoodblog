import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import logo from "../imgs/logo.png";
import AnimationWrapper from '../common/page-animation';
import { Toaster, toast } from 'react-hot-toast';
import defaultBanner from "../imgs/blog banner.png"
import axios from 'axios';
import { EditorContext } from '../pages/editor.pages';
import EditorJS from "@editorjs/editorjs";
import { tools } from './tools.component';
import { UserContext } from '../App';


const url = "http://localhost:3000/editor"

const BlogEditor = () => {

    let { blog, blog: { title, banner , content, tags, des }, setBlog, textEditor, setTextEditor, setEditorState} = useContext(EditorContext)

    let { userAuth: { access_token }} = useContext(UserContext)
    let { blog_id} = useParams();

    let navigate = useNavigate();

    //useEffect
    useEffect(() => {
        if(!textEditor.inReady){
            setTextEditor(  new EditorJS({
                holder: "textEditor",
                data: Array.isArray(content) ? content[0] : content,
                tools: tools,
                placeholder: "Let's write an awesome story"
            }))
        }  
    }, [])

    const [postImage, setPostImage] = useState({ myFile: ""})

    const createPost = async (newImage) => {
        try {
            await axios.post(url, newImage)
        }catch(error){
            console.log(error)
        }
    }


    const handleBannerUpload = async (e) => {
        let loadingToast = toast.loading("Uploading...")
        toast.dismiss(loadingToast);
        toast.success("Success")
        e.preventDefault();
        createPost(postImage)
        console.log("Uploaded")
        const file = e.target.files[0];
        const base64 = await convertToBase64(file);
        setPostImage({ ...postImage, myFile: base64 });
        setBlog({ ...blog, banner: url })
    }

    const handleTitleKeyDown = (e) => {
        if(e.keycode == 13) {
            e.preventDefault();
        }
    }

    const handleTitleChange = (e) => {
        let input = e.target;

        input.style.height = 'auto';
        input.style.height = input.scrollHeight + "px";

        setBlog({ ...blog, title: input.value })

    }

    const handleError = (e) => {
        let img = e.target;
        img.src = defaultBanner;
        
    }

    const handlePublishEvent = () => {
        if(!banner.length){
            return toast.error("Upload a blog banner to publish it")
        }
        if(!title.length){
            return toast.error("Upload a title blog to publish it")
        }
        if(textEditor.isReady){
            textEditor.save().then(data => {
               if(data.blocks.length){
                    setBlog({ ...blog, content: data });
                    setEditorState("Publish")
               } else {
                return toast.error("Write something...")
               }
            })
            .catch((err) => {
                console.log(err);
            })
        }
        
    }

    const handleSaveDraft = (e) => {
        if(e.target.className.includes("disable")){
            return;
          }
      
          if(!title.length){
            return toast.error("Write a title saving it as a draft ")
          }
      
          let loadingToast = toast.loading("Saving draft....");
          e.target.classList.add('disable');

          if(textEditor.isReady){
            textEditor.save().then(content => {

                let blogObj = {
                    title,des,content,tags, draft: true
                }

                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", {...blogOb, id: blog_id},{
                    headers: {
                      'Authorization': `an ${access_token}`
                    }
                  })
                  .then(() => {
                    e.target.classList.remove('disable');
                    toast.dismiss(loadingToast);
                    toast.success("Saved");
              
                    setTimeout(() => {
                      navigate("/")
                    }, 500);
                  })
                  .catch(( { response } ) => {
                    e.target.classList.remove('disable');
                    toast.dismiss(loadingToast);
              
                    return toast.error(response.data.error)
                  })
            })
          }

         
          
    }

  return (
    <>
        <nav className='navbar'>
            <Link to= "/" className='flex w-10'>
                <img src={logo}/>
            </Link>
            <p className='max-md:hidden text-black line-clamp-1 w-full'>
                { title.length ? title : "New Blog" }
            </p>

            <div className='flex gap-4 ml-auto'>
                <button className='btn-dark py-2'
                    onClick={handlePublishEvent}
                >
                    Publish
                </button>
                <button className='btn-light py-2'
                    onClick={handleSaveDraft}
                >
                    Save Draft
                </button>
            </div>
        </nav>
        <Toaster/>
        <AnimationWrapper>
            <section>
                <div className='mx-auto max-w-[900px] w-full'>
                    <div  className='relative aspect-video hover:opacity-80 bg-white border-4 border-grey'>
                       
                        <label  htmlFor='uploadBanner'>
                            <form>
                                <img
                                    className='z-20'
                                    src={postImage.myFile || banner}
                                    onError={handleError}
                                />
                                <input
                                    id='uploadBanner'
                                    type='file'
                                    name='myFile'
                                    accept='.png, .jpg, .jpeg'
                                    hidden
                                    onChange={(e) => handleBannerUpload(e)}
                                />
                                </form>
                        </label> 
                    </div>

                    <textarea
                        defaultValue={title}
                        placeholder='Blog Title'
                        className='text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40'
                        onKeyDown={handleTitleKeyDown}
                        onChange={handleTitleChange}
                    >
                    </textarea>
                    <hr className='w-full opacity-10 my-5'/>

                    <div id="textEditor" className='font-gelasio'>

                    </div>
                </div>
            </section>
        </AnimationWrapper>
    </>
  )
}

export default BlogEditor;

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
            resolve(fileReader.result)
        };
        fileReader.onerror = (error) => {
            reject(error)
        }
    })
}
