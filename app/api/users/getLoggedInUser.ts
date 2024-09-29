import { withSessionAPI } from '../../../lib/session'
import connectMongo from '../../../mongoDB'
import UserDataBase from '../../../mongoDB/user-schema'

const handler = async (req, res) => {
  const email = req.session.user
  await connectMongo()
  const user = await UserDataBase.findOne({ email })

  if (!user) {
    res.status(400).send()
    return
  }

  res.send({ user })
}

export default withSessionAPI(handler)
