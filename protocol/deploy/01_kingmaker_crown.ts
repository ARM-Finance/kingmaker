import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { DeployFunction, DeployResult } from 'hardhat-deploy/types';

import { bold, italic, cyanBright, blueBright } from 'colorette';
import { logDeployResult } from '../libs/deploy';
import { FacetCutAction, getSelectors } from '../libs/diamond/utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments, getNamedAccounts } = hre;
	const { deploy, log } = deployments;
	const { deployer, lepidotteri } = await getNamedAccounts();

	log(bold(blueBright(`\n【】Kingmaker Protocol Smart Contracts`)));
	log(italic(cyanBright(`1) Kingmaker Diamond`)));

	// Deploy DiamondCutFacet.sol contract
	const cutFacet: DeployResult = await deploy('DiamondCutFacet', {
		from: deployer,
		contract: 'DiamondCutFacet',
		args: [],
		skipIfAlreadyDeployed: true,
	});
	logDeployResult(cutFacet, log);

	// Deploy DiamondLoupeFacet.sol contract
	const loupeFacet: DeployResult = await deploy('DiamondLoupeFacet', {
		from: deployer,
		contract: 'DiamondLoupeFacet',
		args: [],
		skipIfAlreadyDeployed: true,
	});
	logDeployResult(loupeFacet, log);

	// Deploy OwnershipFacet.sol contract
	const ownershipFacet: DeployResult = await deploy('OwnershipFacet', {
		from: deployer,
		contract: 'OwnershipFacet',
		args: [],
		skipIfAlreadyDeployed: true,
	});
	logDeployResult(ownershipFacet, log);

	const diamondCut = [
		[cutFacet.address, FacetCutAction.Add, getSelectors(cutFacet.abi)],
		[loupeFacet.address, FacetCutAction.Add, getSelectors(loupeFacet.abi)],
		[ownershipFacet.address, FacetCutAction.Add, getSelectors(ownershipFacet.abi)],
	];

	// Deploy Kingmaker.sol contract
	const crown: DeployResult = await deploy('Kingmaker', {
		from: deployer,
		contract: 'Kingmaker',
		args: [diamondCut, [lepidotteri]],
		skipIfAlreadyDeployed: true,
	});
	logDeployResult(crown, log);
};

export const tags = ['1', 'Kingmaker'];
export default func;