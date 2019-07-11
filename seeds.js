var monggose  = require("mongoose");
var Campground = require("./models/campgrounds");
var Comment = require("./models/comment");
var data = [
{
    name: "cloud rest",
    image: "https://pixabay.com/get/57e2d54b4852ad14f6da8c7dda793f7f1636dfe2564c704c732d7ad29445c05f_340.jpg",
    description: "blah blah blah"
},
{
    name: "Desert mesa",
    image: "https://pixabay.com/get/57e2d54b4852ad14f6da8c7dda793f7f1636dfe2564c704c732d7ad29445c05f_340.jpg",
    description: "blah blah blah"
},
{
    name: "hogwartz",
    image: "https://pixabay.com/get/57e2d54b4852ad14f6da8c7dda793f7f1636dfe2564c704c732d7ad29445c05f_340.jpg",
    description: "blah blah blah"
    
}
]
function seedDB(){
    //remove all campgrounfs
    Campground.remove({},function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("removed campgrounds!!!!!");
            //add a few campgrounds
    data.forEach(function(seed){
        Campground.create(seed,function(err,campground){
            if(err){
                console.log(err);
            }
            else{
                console.log("added a campground");
                //create a comment
                Comment.create(
                {
                   text: "this place is great,but i wish there was internet",
                   author:"homerr"
                },
                    function(err,comment){
                        if(err){
                            console.log(err);
                        }
                        else{
                        campground.comments.push(comment);
                        campground.save();
                        console.log("created new comment");
                        }
                    }
                );
            }
        });
    });
        }
    });
    
}
module.exports = seedDB;
