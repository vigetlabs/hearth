import { createConsumer } from "@rails/actioncable";

const cableUrl = import.meta.env.VITE_CABLE_URL;
export const cable = createConsumer(cableUrl);
