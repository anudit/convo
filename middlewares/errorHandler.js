const withErrorHandler = (fn) => async (req, res) => {
  try {
    return await fn(req, res)
  } catch (err) {
    console.error(err);
    const statusCode = err.statusCode || 500
    const message = err.message || "Oops, something went wrong!"
    res.status(statusCode).json({ statusCode, message })
  }
}

export default withErrorHandler
