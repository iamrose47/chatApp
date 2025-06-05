



const chat=document.getElementById('chat');
const group=document.getElementById('group');
const users=document.getElementById('users');

const msgForm=document.getElementById('msg-form');
const groupForm=document.getElementById('group-form');
const userForm=document.getElementById('user-form');

const userSection=document.getElementById('user-section');
const groupSection=document.getElementById('group-section');
const msgSection = document.getElementById("msg-section");
const backbtn=document.getElementById('back-btn');
const logoutBtn=document.getElementById('logout');
const sessionToken=localStorage.getItem('sessionToken');
if(!sessionToken){
  document.querySelector('body').innerHTML = "<h1 style=text-align:center;color:red; >Login First<h1>"
}

logoutBtn.addEventListener('click',()=>{
    localStorage.removeItem('sessionToken')
    window.location.href = "../user/login";
})
backbtn.addEventListener('click',loadGroup);



function loadMessageLocal() {
  setInterval(() => {
    const msgs = JSON.parse(localStorage.getItem("msgs"));
    const groupId = JSON.parse(localStorage.getItem("groupId"));
    if (msgs.length==0) {
      loadMessage(groupId,0);
    } else {
      loadMessage(groupId,msgs[msgs.length - 1].id);
    }
  }, 100);
}

function loadMessage(groupId,lastMsg) {
  console.log(groupId);
  const token = localStorage.getItem("sessionToken");
  axios
    .get(`http://localhost:3000/msg/get?groupId=${groupId}&lastMsg=${lastMsg}`, {
      headers: {
        Authorization: token,
      },
    })
    .then((response) => {
      chat.innerText = "";
      const msgs = JSON.parse(localStorage.getItem("msgs"));
      let newMsg;
      if (msgs.length == 0 ) {
        newMsg = response.data.msgs;
      } else {
        newMsg = [...msgs, ...response.data.msgs];
      }
      localStorage.setItem("msgs", JSON.stringify(newMsg));
      newMsg.forEach((msg) => {
        if (msg.sender === response.data.user) {
          showMsg(msg, "You", "right-msg");
        } else {
          showMsg(msg, msg.sender, "left-msg");
        }
      });
    })
    .catch((err) => {
      console.log(err);
      notify(err.response.data);
    });
}
loadMessageLocal();


msgForm.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const token=localStorage.getItem('sessionToken');
    try {
        const message=e.target.msg.value;
      const response=await axios.post(`http://localhost:3000/msg/send/${userForm.lastElementChild.id}`,{
       msg:message,
       
      },
      {
        headers:{
            authorization:token,
        }
      }
      ) 
      if(response.status==200) {
        console.log(response);
        showMsg(response.data,"You","right-msg");
      }
      else{
        throw {response:response};
      }

    } catch (error) {
        console.log(error);
        notify(error.response.data);
    }
    e.target.msg.value="";
})



groupForm.addEventListener('submit',async(e)=>{
   
    try {
    e.preventDefault();
    const token=localStorage.getItem('sessionToken');
    // console.log(token);
  
        const group=e.target.group.value;
     const response= await axios.post('http://localhost:3000/group/create',{
        group:group,
      },
      {
        headers:{
            authorization:token,
        }
      }
      
      )
     
    if(response.status==200){
        notify(response.data);
        showGroup(e.target.group.value,response.data.groupId)
        console.log(response.data);
       
    }

        

    } catch (error) {
        console.log(error);
        notify(error.response.data);
    }
    e.target.group.value="";
});

function showGroup (groupName,groupId){
    const textNode = `<div class="group-name" id="${groupId}"  style="display:flex;justify-content:space-between;"><span>${groupName}</span> <span> <i class="fa-solid fa-trash" style="color: #c5280d;" onClick=deleteGroup(${groupId})></i></span></div>`;
    group.innerHTML += textNode;
}

group.addEventListener('click',async(e)=>{
    try {
        if(e.target.classList.contains('group-name')){
          const token=localStorage.getItem('sessionToken');
          const groupId = e.target.id;
          localStorage.setItem("groupId", groupId); 
          const response= await axios.get(`http://localhost:3000/group/get/${e.target.id}`,{
            headers:{
                authorization:token,
            }
          });
          if(response.status==200){
            userForm.lastElementChild.id=e.target.id;
            users.innerText="";
            groupSection.style.display='none';
            userSection.style.display='block';
            msgSection.style.display='flex';
          
            response.data.users.forEach((user)=>{
                showUser(user.name);
            })
            localStorage.setItem('msgs',JSON.stringify(response.data.msgs));
            // response.data.msgs.forEach((msg)=>{
            //     if(msg.sender==response.data.user){
            //         showMsg(msg,"You","right-msg");
            //     }
            //     else{
            //         showMsg(msg, msg.sender, "left-msg"); 
            //     }
            // })
        

          }
          else{
            throw {response:response}
          }


        } 
       
    } catch (error) {
        console.log(error);
        notify(error.response.data);
    }
   
})

function showMsg(msg,user,side){
    console.log(msg);
    const options={
        hour:'2-digit',
        minute:'2-digit',
    };
    const time=new Intl.DateTimeFormat('en-IN',options).format(new Date(msg.createdAt));
    const textNode=`<div class="msg ${side}">
    <div class="msg-bubble">
      <div class="msg-info">
        <div class="msg-info-name">${user}</div>
        <div class="msg-info-time">${time}</div>
      </div>

      <div class="msg-text">${msg.message}</div>
    </div>
  </div>`;
  chat.innerHTML += textNode;
}




function showUser(user){
    const textNode=`<div  class='group-name'>${user}</div>`;
    users.innerHTML+=textNode;
    
}

userForm.addEventListener('submit',async (e)=>{
    e.preventDefault();
    try {
        const email=e.target.user.value;
        const token=localStorage.getItem('sessionToken');
        const response=await axios.post(`http://localhost:3000/group/add-user/${userForm.lastElementChild.id}`,{
            userEmail:email,
        },{
            headers:{
                authorization:token,
            }
        }
        )

     if(response.status==200){
        notify(response.data);
        showUser(response.data.user);

       
     
        
     }
     else{
        throw {response:response};
      
     }

    } catch (error) {
        console.log(error);
        notify(error.response.data);
    }
    e.target.user.value="";
})
window.addEventListener('DOMContentLoaded',loadGroup);
async function loadGroup(){
const token=localStorage.getItem('sessionToken');
try {
   const response=await axios.get('http://localhost:3000/group/get',{
    headers:{
        authorization:token,
    }
   })
   group.innerText="";
   
   msgSection.style.display='none';
   groupSection.style.display='block';
   userSection.style.display='none';
   console.log(response.data);
   response.data.forEach((group) => {
    showGroup(group.name, group.id);
  });
 

} catch (error) {
    console.log(error);
    notify(error.response.data); 
}


}

async function deleteGroup(groupId){
  const token=localStorage.getItem('sessionToken');
  console.log(groupId);
  try {
    const response=await axios.delete(`http://localhost:3000/group/delete/${groupId}`,{
      headers:{
          authorization:token,
      }
     })

     if(response.status==200){
      notify(response.data);
     

     }
     else{
      throw {response:response};
     }
  } catch (error) {
    console.log(error);
    notify(error.response.data); 
  }
  loadGroup();
}