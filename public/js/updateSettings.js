import axios from "axios";
import { showAlert } from "./alert";

export const updateData = async (name, email) => {
  try {
    const updatedUser = await axios({
      method: "PATCH",
      url: "http://127.0.0.1:8000/api/v1/users/updateMe",
      data: {
        name: name,
        email: email,
      },
    });
    if (updatedUser.data.status === "Success") {
      showAlert("success", "Account Updated");
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};

export const updateSettings = async (data, type) => {
  const url =
    type === "password"
      ? "http://127.0.0.1:8000/api/v1/users/updateMyPassword"
      : "http://127.0.0.1:8000/api/v1/users/updateMe";
  try {
    const updatedUser = await axios({
      method: "PATCH",
      url: url,
      data,
    });
    if (updatedUser.data.status === "Success") {
      showAlert(
        "success",
        `User ${type.toUpperCase()} Updated!`
      );
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};
