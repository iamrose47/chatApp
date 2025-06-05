

const form =document.querySelector('form');

form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    try {
        const email = e.target.email.value;
        const password = e.target.password.value;
        
        const response=await axios.post('http://localhost:3000/user/login',{
            email: email,
            password: password,
        })
        if(response.status==200){
            localStorage.setItem("sessionToken",response.data.sessionToken);
            notify(response.data);
            window.location.href='../chat/chat';
         
        }
        else{
            throw {response:response}
        }


    } catch (error) {
        notify(error.response.data);
        console.log(error);
    }
})