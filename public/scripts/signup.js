const form=document.querySelector('form');

form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    
    try {
        
        const response=await axios.post('http://localhost:3000/user/signup',{
            name:e.target.name.value,
            email:e.target.email.value,
            mobilenumber:e.target.mobilenumber.value,
            password:e.target.password.value,
        })

        if(response.status==200){
            notify(response.data);
        }
        else {
            throw{response:response}
        }


    } catch (error) {
        notify(error.response.data);
        console.log(error);
    }
    e.target.name.value="";
    e.target.email.value="";
    e.target.mobilenumber.value="";
    e.target.password.value="";
    
})