console.log("Step 1: cors");
import("cors").then(() => {
  console.log("Step 2: express");
  return import("express");
}).then(() => {
  console.log("Step 3: mongoose");
  return import("mongoose");
}).then(() => {
  console.log("Step 4: @clerk/express");
  return import("@clerk/express");
}).then(() => {
  console.log("Step 5: appointmentRouter");
  return import("./routes/appointmentRouter.js");
}).then(() => {
  console.log("Step 6: doctorRouter");
  return import("./routes/doctorRouter.js");
}).then(() => {
  console.log("Step 7: serviceRoutes");
  return import("./routes/serviceRoutes.js");
}).then(() => {
  console.log("Step 8: serviceAppointmentRouter");
  return import("./routes/serviceAppointmentRouter.js");
}).then(() => {
  console.log("Step 9: nexusRouter");
  return import("./routes/nexusRouter.js");
}).then(() => {
  console.log("ALL IMPORTS SUCCEEDED!");
  process.exit(0);
}).catch(err => {
  console.error("FAILED AT STEP:", err);
  process.exit(1);
});
