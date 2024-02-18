
const cl = console.log;

const postForm = document.getElementById("postForm");
const titleCtrl = document.getElementById("title");
const contentCtrl = document.getElementById("content");
const userIdCtrl = document.getElementById("userId");
const cardContainer = document.getElementById("cardContainer");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");

const baseUrl = `https://crud-async-default-rtdb.asia-southeast1.firebasedatabase.app/`;
const postUrl = `${baseUrl}/posts.json`;

const editPost = async (ele) => {
    let editId = ele.closest(".card").id;
    localStorage.setItem("editId",editId);
    let editUrl = `${baseUrl}/posts/${editId}.json`;
    try{
        let data = await makeApiCall("GET",editUrl);
        titleCtrl.value = data.title;
        contentCtrl.value = data.body;
        userIdCtrl.value = data.userId;

        submitBtn.classList.add("d-none");
        updateBtn.classList.remove("d-none");
        window.scrollTo(0,0);
    }
    catch(err){
        cl(err);
    }
    finally{
        loader.classList.add("d-none");
    }

}

const deletePost = (ele) => {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
           let deleteId = ele.closest(".card").id;
           let deleteUrl = `${baseUrl}/posts/${deleteId}.json`;

           try{
              let res = await makeApiCall("DELETE",deleteUrl);
              document.getElementById(deleteId).remove();
           }
           catch(err){
            cl(err);
           }
           finally{
             loader.classList.add("d-none");
           }

          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success"
          });
        }
      });
}

const templatingPost = (arr) => {
    cardContainer.innerHTML = arr.map((post) => {
       return `<div class="card mb-3" id="${post.id}">
                    <div class="card-header">
                        <h4 class="m-0 d-flex justify-content-between">${post.title}
                        <small>UserId: ${post.userId}</small>
                        </h4>
                    </div>
                    <div class="card-body">
                        <p class="m-0">${post.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-success" onclick="editPost(this)">Edit</button>
                        <button class="btn btn-danger" onclick="deletePost(this)">Delete</button>
                    </div>
                </div>`; 
    }).join("");
}

const createCard = (obj) => {
    let card = document.createElement("div");
    card.className = `card mb-3`;
    card.id = obj.id;
    card.innerHTML = `  <div class="card-header">
                            <h4 class="m-0 d-flex justify-content-between">${obj.title}
                              <small>UserId: ${obj.userId}</small>
                            </h4>
                        </div>
                        <div class="card-body">
                            <p class="m-0">${obj.body}</p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn btn-success" onclick="editPost(this)">Edit</button>
                            <button class="btn btn-danger" onclick="deletePost(this)">Delete</button>
                        </div>`;
    cardContainer.prepend(card);           
}

const makeApiCall = (methodName,apiUrl,msgBody = null) => {
    return new Promise((resolve,reject) => {
        loader.classList.remove("d-none");

        let xhr = new XMLHttpRequest();
        xhr.open(methodName,apiUrl);
        xhr.send(JSON.stringify(msgBody));

        xhr.onload = function(){
           if(xhr.status >= 200 && xhr.status < 300){
             resolve(JSON.parse(xhr.response));
           } 
           else{
             reject("something went wrong");
           }
        }
    })
}

const fetchPost = async () => {
    try{
        let res = await makeApiCall("GET",postUrl);
        let postArr = [];
        for(const key in res){
          let postObj = {...res[key],id:key};
          postArr.push(postObj);  
        }
        templatingPost(postArr);
    }
    catch(err){
        cl(err);
    }
    finally{
        loader.classList.add("d-none");
    }
}
fetchPost();

const submitPost = async (eve) => {
    eve.preventDefault();
    let postObj = {
        title: titleCtrl.value,
        body: contentCtrl.value,
        userId: userIdCtrl.value
    }
    try{
        let data = await makeApiCall("POST",postUrl,postObj);
        postObj.id = data.name;
        createCard(postObj);
        Swal.fire({
            title: `${postObj.title} post added successfully`,
            icon: "success",
            timer: 3000
        })
    }
    catch(err){
        cl(err);
    }
    finally{
        postForm.reset();
        loader.classList.add("d-none");
    }

}

const updateCard = (obj) => {
    let card = [...document.getElementById(obj.id).children];
    card[0].innerHTML = `   <h4 class="m-0 d-flex justify-content-between">${obj.title}
                             <small>UserId: ${obj.userId}</small>`;
    card[1].innerHTML = `<p class="m-0">${obj.body}</p>`
}

const updatePost = async () => {
    let updateId = localStorage.getItem("editId");
    let updatePost = {
        title: titleCtrl.value,
        body: contentCtrl.value,
        userId: userIdCtrl.value,
        id: updateId
    }
    let updateUrl = `${baseUrl}/posts/${updateId}.json`;
   
    try{
        let res = await makeApiCall("PATCH",updateUrl,updatePost);
        updateCard(res);
        Swal.fire({
            title: `${res.title} post updated successfully`,
            icon: "success",
            timer: 3000
        })
    }
    catch(err){
        cl(err)
    }
    finally{
        loader.classList.add("d-none");
        updateBtn.classList.add("d-none");
        submitBtn.classList.remove("d-none")
        postForm.reset();
    }
    
}

postForm.addEventListener("submit",submitPost);
updateBtn.addEventListener("click",updatePost);