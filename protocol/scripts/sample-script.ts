// @ts-ignore
import { run, ethers } from "@nomiclabs/buidler";

async function main() {
    // We get the contract to deploy
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Kingmaker!");

    await greeter.deployed();

    console.log("Greeter deployed to:", greeter.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });