const solanaWeb3 = require('@solana/web3.js')

const router = express.Router()

async function transfer()
{
    solanaWeb3.SystemProgram.transfer()
}
