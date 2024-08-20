import React, { useEffect, useState } from 'react'
import AnimationWrapper from '../common/page-animation'
import InPageNavigation from '../components/inpage-navigation.component'
import axios from 'axios';
import Loader from '../components/loader.component';
import BlogPostCard from '../components/blog-post.component';
import MinimalBlogPost from '../components/nobanner-blog-post.component';


const HomePage = () => {

  let [blogs, setBlogs] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);

  let catergories = ["banhcanhghevungtau", "banhxeocantho", "thangco", "phohanoi", "banhmy", "comtamsaigon", "chaoluonnghean", "bunbohue", "comgatamky"];

  const fetchLatestBlogs = () =>{
    axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
    .then(({data}) => {
        setBlogs(data.blogs)
    })
    .catch(err => {
        console.log(err);
    })
  }
  const fetchTrendingBlogs = () =>{
    axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
    .then(({data}) => {
        setTrendingBlogs(data.blogs)
    })
    .catch(err => {
        console.log(err);
    })
  }

  useEffect(()=>{
    fetchLatestBlogs();
    fetchTrendingBlogs();
  },[])

  



  return (
    <AnimationWrapper>
        <section className='h-cover flex justify-center gap-10'>
            {/*lastest blog*/ }
            <div className='w-full'>
                <InPageNavigation routes={["Home","Trending blogs"]} defaultHidden ={ ["Trending blogs"]}>
                   <>
                        {
                            blogs ==  null ? <Loader/> :
                            blogs.map((blog, i) => {
                                return <AnimationWrapper transition={{ duration: 1, delay: i*.1 }} key={i}>
                                  <BlogPostCard content={blog} author={blog.author.personal_info}/>
                                </AnimationWrapper>
                            })
                        }
                   </>
                    {
                        trendingBlogs ==  null ? <Loader/> :
                        trendingBlogs.map((blog, i) => {
                            return <AnimationWrapper transition={{ duration: 1, delay: i*.1 }} key={i}>
                             <MinimalBlogPost blog={blog} index={i}/>
                            </AnimationWrapper>
                        })
                    }
                </InPageNavigation>
            </div>
            {/*filters and treding blogs*/ }
            <div className='min-w-[40%] lg:min-w-[400px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden'>
                <div className='flex flex-col gap-10 mb-3'>
                  <div>
                      <h1 className='font-medium text-xl mb-8'>Stories form all interests</h1>
                      <div className='flex gap-3 flex-wrap'>
                        {
                            catergories.map((catergories, i) => {
                              return <button className='tag' key={i}>
                               {catergories}
                              </button>
                            })
                        }
                      </div>
                    </div>
                </div>
                <div>
                  <h1 className='font-medium text-xl mb-8 '>Trending <i className='fi fi-rr-arrow-trend-up'></i></h1>

                  {
                        trendingBlogs ==  null ? <Loader/> :
                        trendingBlogs.map((blog, i) => {
                            return <AnimationWrapper transition={{ duration: 1, delay: i*.1 }} key={i}>
                             <MinimalBlogPost blog={blog} index={i}/>
                            </AnimationWrapper>
                        })
                    }
                </div>
            </div>
        </section>
    </AnimationWrapper>
  )
}

export default HomePage
