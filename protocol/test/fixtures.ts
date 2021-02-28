import { ethers, deployments, getNamedAccounts, getUnnamedAccounts } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
	FIRST_KING_SUPPLY_CHANGE,
	INITIAL_KING_REWARDS_BALANCE,
	INITIAL_KING_LIQUIDITY,
	SUSHI_ADDRESS,
	MASTERCHEF_ADDRESS,
	KING_REWARDS_PER_BLOCK,
	KING_REWARDS_START_BLOCK,
} from '../libs/deploy';

export const token = deployments.createFixture(async (hre: HardhatRuntimeEnvironment) => {
	const [deployer, lepidotteri, SHA_2048, Jester] = await ethers.getSigners();
	const admin = lepidotteri;

	const govTokenFactory = await ethers.getContractFactory('KING');
	const KING = await govTokenFactory.deploy(admin.address, deployer.address, FIRST_KING_SUPPLY_CHANGE);

	const multisendFactory = await ethers.getContractFactory('Multisend');
	const Multisend = await multisendFactory.deploy(KING.address);

	return {
		admin: admin,
		govToken: KING,
		multisend: Multisend,
		deployer: deployer,
		lepidotteri: lepidotteri,
		SHA_2048: SHA_2048,
		Jester: Jester,
	};
});

export const governance = deployments.createFixture(async (hre: HardhatRuntimeEnvironment) => {
	const [deployer, lepidotteri, SHA_2048, King, Bishop, Jester] = await ethers.getSigners();
	const admin = lepidotteri;

	const govTokenFactory = await ethers.getContractFactory('KING');
	const KING = await govTokenFactory.deploy(admin.address, deployer.address, FIRST_KING_SUPPLY_CHANGE);

	const monasteryFactory = await ethers.getContractFactory('Monastery');
	const Monastery = await monasteryFactory.deploy(KING.address);

	const crownFactory = await ethers.getContractFactory('Crown');
	const CrownImplementation = await crownFactory.deploy();
	const crownPrismFactory = await ethers.getContractFactory('CrownPrism');
	const CrownPrism = await crownPrismFactory.deploy(deployer.address);
	const Crown = new ethers.Contract(CrownPrism.address, CrownImplementation.interface, deployer);

	const lordFactory = await ethers.getContractFactory('Lord');
	const Lord = await lordFactory.deploy(CrownPrism.address, deployer.address);

	const treasuryFactory = await ethers.getContractFactory('Treasury');
	const Treasury = await treasuryFactory.deploy(Lord.address);

	return {
		admin: admin,
		govToken: KING,
		monastery: Monastery,
		crownImp: CrownImplementation,
		crown: Crown,
		crownPrism: CrownPrism,
		lord: Lord,
		treasury: Treasury,
		deployer: deployer,
		lepidotteri: lepidotteri,
		SHA_2048: SHA_2048,
		King: King,
		Jester: Jester,
		Bishop: Bishop,
	};
});

export const rewards = deployments.createFixture(async (hre: HardhatRuntimeEnvironment) => {
	const [deployer, lepidotteri, SHA_2048, feeCollector, King, Dragon] = await ethers.getSigners();
	const admin = lepidotteri;
	const liquidityProvider = King;
	const treasurer = Dragon;

	// TODO: here it's missing a big logical chunk i.e. the steps undertaken by deployment scripts
	// e.g. allocate token to "DAO" (Treasurer/Treasury)
	const govTokenFactory = await ethers.getContractFactory('KING');
	const KING = await govTokenFactory.deploy(admin.address, deployer.address, FIRST_KING_SUPPLY_CHANGE);
	await deployer.sendTransaction({ to: treasurer.address, value: ethers.utils.parseEther('1.0') });
	const balanceOfDeployer = await KING.balanceOf(deployer.address);
	console.log('$KING Balance of Deployer:', balanceOfDeployer.toString());
	// so, for the sake of Treasury.sol test suites, we manually xfer entire deployer KING balance to the treasurer
	await KING.connect(deployer).transfer(treasurer.address, ethers.BigNumber.from(balanceOfDeployer))
	await KING.connect(treasurer).transfer(admin.address, ethers.BigNumber.from(INITIAL_KING_REWARDS_BALANCE));
	await KING.connect(treasurer).transfer(deployer.address, ethers.BigNumber.from(INITIAL_KING_REWARDS_BALANCE));
	await KING.connect(treasurer).transfer(lepidotteri.address, ethers.BigNumber.from(INITIAL_KING_LIQUIDITY));
	await KING.connect(treasurer).transfer(SHA_2048.address, ethers.BigNumber.from(INITIAL_KING_LIQUIDITY));
	await deployer.sendTransaction({ to: lepidotteri.address, value: ethers.utils.parseEther('1.0') });
	await deployer.sendTransaction({ to: SHA_2048.address, value: ethers.utils.parseEther('1.0') });
	// end of manual reconciliation

	const crownFactory = await ethers.getContractFactory('Crown');
	const CrownImp = await crownFactory.deploy();
	const crownPrismFactory = await ethers.getContractFactory('CrownPrism');
	const CrownPrism = await crownPrismFactory.deploy(deployer.address);
	const Crown = new ethers.Contract(CrownPrism.address, CrownImp.interface, deployer);
	await CrownPrism.connect(deployer).setPendingProxyImplementation(CrownImp.address);
	await CrownImp.connect(deployer).become(Crown.address);

	const lordFactory = await ethers.getContractFactory('Lord');
	const Lord = await lordFactory.deploy(Crown.address, deployer.address);
	await Crown.connect(deployer).setLockManager(Lord.address);

	const treasuryFactory = await ethers.getContractFactory('Treasury');
	const Treasury = await treasuryFactory.deploy(Lord.address);

	const treasurerFactory = await ethers.getContractFactory('Treasurer');
	const Treasurer = await treasurerFactory.deploy(
		admin.address,
		Lord.address,
		Treasury.address,
		KING.address,
		SUSHI_ADDRESS,
		MASTERCHEF_ADDRESS,
		KING_REWARDS_START_BLOCK,
		KING_REWARDS_PER_BLOCK
	);
	await KING.connect(admin).approve(Treasurer.address, INITIAL_KING_REWARDS_BALANCE);

	return {
		admin: admin,
		govToken: KING,
		treasury: Treasury,
		treasurer: treasurer,
		lord: Lord,
		deployer: deployer,
		feeCollector: feeCollector,
		liquidityProvider: liquidityProvider,
		lepidotteri: lepidotteri,
		SHA_2048: SHA_2048,
		King: King,
	};
});