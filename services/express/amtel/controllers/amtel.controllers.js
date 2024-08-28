const DeploymentsModel = require('../../deployments/models/deployment.model');

const retrieveCandidateEnvironment = async (req, res) => {
  const { platformType } = req.query;
  const { versioningOrder } = req.query;
  const { testPhase } = req.query;

  if (!platformType || !versioningOrder || !testPhase) {
    return res.status(400).json('Incorrect use of API. Please see API docs for correct format');
  }

  if ((versioningOrder !== 'latest') && (versioningOrder !== 'oldest')) {
    return res.status(400).json(`${versioningOrder} is not a correct versioning order. Plese see API docs`);
  }

  DeploymentsModel.find({ $and: [{ testPhase }, { platformType }, { systemHealthCheckStatus: 'COMPLETED' }, { state: 'IDLE' }] }).exec((err, Deployments) => {
    let candidateEnvironment;
    let candidateProductSetFormatted;
    let candidateProductSet;

    Deployments.forEach((environment) => {
      let productSetVersionArray = [];

      if (environment.productSet) {
        productSetVersionArray = environment.productSet.split('.');
        if (productSetVersionArray[2].length === 1) {
          productSetVersionArray[2] = `00${productSetVersionArray[2]}`;
        } else if (productSetVersionArray[2].length === 2) {
          productSetVersionArray[2] = `0${productSetVersionArray[2]}`;
        }
        const manipulatedProductSetVersion = parseInt(productSetVersionArray.join(''), 10);

        if (candidateEnvironment) {
          if (versioningOrder === 'latest') {
            if (manipulatedProductSetVersion > candidateProductSet) {
              candidateEnvironment = environment.name;
              candidateProductSet = manipulatedProductSetVersion;
              candidateProductSetFormatted = environment.productSet;
            }
          } else if (versioningOrder === 'oldest') {
            if (manipulatedProductSetVersion < candidateProductSet) {
              candidateEnvironment = environment.name;
              candidateProductSet = manipulatedProductSetVersion;
              candidateProductSetFormatted = environment.productSet;
            }
          }
        } else {
          candidateEnvironment = environment.name;
          candidateProductSet = manipulatedProductSetVersion;
          candidateProductSetFormatted = environment.productSet;
        }
      }
    });
    return res.status(200).json({
      environment: candidateEnvironment,
      productSet: candidateProductSetFormatted,
    });
  });
};

module.exports = {
  retrieveCandidateEnvironment,
};
