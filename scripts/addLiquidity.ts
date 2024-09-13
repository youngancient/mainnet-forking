import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    // const amountOut = ethers.parseUnits("20", 18);
    // const amountInMax = ethers.parseUnits("1000", 6);
    const amountUSDCDesired = ethers.parseUnits("2", 6);
    const amountUSDCMin = ethers.parseUnits("5", 6);
    const amountDAIDesired = ethers.parseUnits("1", 18);
    const amountDAIInMin = ethers.parseUnits("5", 18);

    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner);
    
    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    await USDC_Contract.approve(ROUTER, amountUSDCDesired);
    await DAI_Contract.approve(ROUTER, amountDAIDesired);
   
    const usdcBal = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBal = await DAI_Contract.balanceOf(impersonatedSigner.address);
    const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

    console.log("usdc balance before adding Liquidity", Number(usdcBal));
    console.log("dai balance before adding Liquidity", Number(daiBal));

    if(usdcBal < amountUSDCMin || daiBal < amountDAIInMin){
        console.error("Insufficient amount of tokens for adding liquidity");
        return;
      }

  await ROUTER.addLiquidity(
    USDC,
    DAI,
    amountUSDCDesired,
    amountDAIDesired,
    0,
    0,
    impersonatedSigner,
    deadline
  );

    const usdcBalAfter = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await DAI_Contract.balanceOf(impersonatedSigner.address);

    console.log("=========================================================");

    console.log("usdc balance after adding liquidity", Number(usdcBalAfter));
    console.log("dai balance after adding liquidity", Number(daiBalAfter));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
