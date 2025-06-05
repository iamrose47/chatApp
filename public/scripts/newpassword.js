const newPasswordForm = document.getElementById('new-password-form');
const url = window.location.href;
const baseURL = url.substring(0, url.lastIndexOf('/password'));
const uuid = url.substring(url.lastIndexOf('/') + 1);

// Populate the hidden input field with the UUID
const uuidInput = document.getElementById('uuid-input');
uuidInput.value = uuid;
newPasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    console.log(e.target.uuid.value);
    if (e.target.confirmpassword.value === e.target.newpassword.value) {
      const response = await axios.post(`${baseURL}/password/new-password`, {
        email: e.target.email.value,
        newPassword: e.target.newpassword.value,
        uuid: uuidInput.value , // Add the UUID from the hidden input field
      });

      if (response.status === 200) {
        window.location.href = `${baseURL}/password/passwordchanged`;
      } else {
        throw { response: response };
      }
    } else {
      notify({type:"error",message:"Password doesn't match!"});
    }
  } catch (error) {
    notify(error.response.data);
    console.log(error);
  }
});