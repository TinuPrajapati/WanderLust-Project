let deleteBtn=document.querySelector(".delete");
let form=document.querySelector("form");

deleteBtn.addEventListener("click",()=>{
    let x;
    if(confirm("Are you want to delete this listing")){
        x="/listings/<%= listing._id %>?_method=DELETE";
    }
    form.setAttribute("action",x);
})