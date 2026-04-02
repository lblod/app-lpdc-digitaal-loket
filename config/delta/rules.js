import resource from './resource';
import feedbackManagementService from "./feedbackManagementService";
import errorAlert from "./error-alert";

export default [
  ...resource,
    ...feedbackManagementService,
    ...errorAlert
];
