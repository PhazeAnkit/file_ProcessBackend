import app from "./app";

const PORT = process.env.PORT || "4000";

app.listen(PORT, () => {
  console.log(
    `Server is open on ${PORT} and Running on http://localhost:${PORT} `
  );
});
