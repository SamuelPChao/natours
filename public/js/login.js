import axios from "axios";
import { showAlert } from "./alert";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/v1/users/login",
      data: {
        email: email,
        password: password,
      },
    });

    if (res.data.status === "Success") {
      showAlert("success", "Logged In");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "get",
      url: "http://127.0.0.1:8000/api/v1/users/logout",
    });
    if (res.data.status === "Success") {
      showAlert("success", "Logged In");
      //Pass true to force a reload bypassing the cache. Defaults to false.
      location.reload(true);
    }
  } catch (err) {
    console.log(err.response);
    showAlert(
      "error",
      "Error Loggin Out, Please Try Again!"
    );
  }
};
