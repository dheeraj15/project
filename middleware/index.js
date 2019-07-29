//all middleware goes here
var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");
var middlewareObj = {};
middlewareObj.checkCampgroundOwnership = function(req,res,next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id,function(err,foundCampground){
            if(err){
                req.flash("error","Product not found");
                res.redirect("back");
            }
            else{
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error","You do not have permission to do that");
                    res.redirect("/campgrounds");
                }
            }
           });
    }
    else{
        req.flash("error","You need to be logged in to do that");
        res.redirect("back");
    }
  

}
middlewareObj.checkCommentOwnership=function(req,res,next){
    if(req.isAuthenticated()){
        
        Comment.findById(req.params.comment_id,function(err,foundComment){
            //console.log(foundComment.author.id);
            if(err){
                res.redirect("back");
            }
            else{
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error","You do not have permission to do that");
                    res.redirect("/campgrounds");
                }
            }
           });
    }
    else{
        req.flash("error","You need to log in to do that");
        res.redirect("back");
    }
  

}
middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }

    req.flash("error","You need to be logged in to do that");
    res.redirect("/login");
}


module.exports = middlewareObj;
