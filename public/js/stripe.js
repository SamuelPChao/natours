import axios from "axios";
import { showAlert } from "./alert";
const stripe = Stripe(
  "pk_test_51NGP8BBZjK3aIaqezm5EqRoGePYwbQ3B7LiftMUrcUSJepEtdG0pWdwtQkXzApctKKpx5OOHgc43VUsSNejOQoaJ007xmz7QCf"
);
export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
