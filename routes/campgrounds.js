var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var middleware = require("../middleware");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dwk9sar55', 
  api_key: '672489249877726', 
  api_secret: 'OH4Jl5B80KAMloUGI346fLxHcV8'
});


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

/*router.post("/campgrounds",middleware.isLoggedIn,upload.single('image'),function(req,res){
    //res.send("you hit the post route");S
        //get data from form and add to campgroubds array
        //redirect back to the campgrounds page
        /*var name=req.body.name;
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
cloudinary.uploader.upload(req.file.path, function(result) {
    // add cloudinary url for the image to the campground object under image property
    req.body.campground.image = result.secure_url;
    //add image's public_id to campground object
    req.body.campground.imageId = result.public_id;
    // add author to campground
    
    req.body.campground.author = {
      id: req.user._id,
      username: req.user.username
    }
    Campground.create(req.body.campground, function(err, campground) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      res.redirect('/campgrounds/' + campground.id);
    });
  });
});*/
router.post("/campgrounds", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
      // add author to campground
     req.body.campground.imageId = result.public_id;
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
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

router.put("/campgrounds/:id",middleware.checkCampgroundOwnership,upload.single('image'),async function(req,res){
    //find and update the correct campground
    Campground.findById(req.params.id,async function(err,campground){
        //console.log(req.body.name);
        //console.log(req.body.price);
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
        }
        else{
            if(req.file){
                try{
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    //console.log(result);
                    campground.imageId = result.public_id;
                    campground.image = result.secure_url;
                }
                catch(err){
                    req.flash("error",err.message);
                    return res.redirect("back");
                } 
            }
            //console.log(req.body.name);
            //onsole.log(req.body.price);
            campground.name = req.body.campground.name;
            campground.price = req.body.campground.price;
            campground.location = req.body.campground.location;
            campground.quantity = req.body.campground.quantity;
            campground.contact = req.body.campground.contact;
            campground.description = req.body.campground.description;
            campground.save();
            req.flash("success","Updated successfully");
            res.redirect("/campgrounds/"+ campground._id);
        }
    });
    //redirect somewhere
});


//Destroy campground route
router.delete("/campgrounds/:id",middleware.checkCampgroundOwnership,function(req,res){
    Campground.findById(req.params.id,async function(err,campground){
        if(err){
            req.flash("error",err.message);
            return res.redirect("back");
        }
        try{    
            await cloudinary.v2.uploader.destroy(campground.imageId);
            campground.remove();
            req.flash("success","Product successfully removed");
            res.redirect("/campgrounds");

        }
        catch(err){
            req.flash("error",err.message);
            return res.redirect("back");
        }
    });
}); 

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;