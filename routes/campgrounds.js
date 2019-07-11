var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var middleware = require("../middleware");

router.get("/campgrounds",function(req,res){
    if(req.query.search){
        //console.log(req.query.search);
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name:regex},function(err,allcampgrounds){
            if(err){
                console.log(err);

            }
            else{
                res.render("campgrounds/campgrounds",{campgrounds:allcampgrounds});
            }
    });
    }
    //Get all campgrounds from db
    else{
    Campground.find({},function(err,allcampgrounds){
            if(err){
                console.log(err);

            }
            else{
                res.render("campgrounds/campgrounds",{campgrounds:allcampgrounds});
            }
    });
    //res.render("campgrounds",{campgrounds:campgrounds});
    }
}); 

router.post("/campgrounds",middleware.isLoggedIn,function(req,res){
    //res.send("you hit the post route");S
        //get data from form and add to campgroubds array
        //redirect back to the campgrounds page
        var name=req.body.name;
        var price = req.body.price;
        var image=req.body.image;
        var desc=req.body.description;
        var author = {
            id:req.user._id,
            username:req.user.username
        }
        var newcampground={name: name,price:price,image: image,description: desc,author:author};
        //Create a new campground and save to db
        Campground.create(newcampground,function(err,newlycreated){
            if(err){
                
                console.log(err);

            }
            else{

                res.redirect("/campgrounds");
            }
        });
        //campgrounds.push(newcampground);
        //res.redirect("/campgrounds"); 
});
router.get("/campgrounds/new",middleware.isLoggedIn, function(req,res){
    res.render("campgrounds/new");
});

router.get("/campgrounds/:id",function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err,campground){
        if(err){
            console.log(err);
        }
        else{
            //console.log(foundCampround);
            res.render("campgrounds/show",{campground: campground});
        }
    });
    //find the campground with provided id
    //render show template
   
    //res.render("show");
});
//edit campground route
router.get("/campgrounds/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
        Campground.findById(req.params.id,function(err,foundCampground){
        res.render("edit",{campground:foundCampground});
    });
});



//update campground route

router.put("/campgrounds/:id",middleware.checkCampgroundOwnership,function(req,res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        }
        else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
    //redirect somewhere
});


//Destroy campground route
router.delete("/campgrounds/:id",middleware.checkCampgroundOwnership,function(req,res){
   Campground.findByIdAndRemove(req.params.id,function(err){
    if(err){
        res.redirect("/campgrounds");
    }
    else{
        res.redirect("/campgrounds");
    } 
   });
});

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;