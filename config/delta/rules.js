import resource from "./resource";
import feedbackManagementService from "./feedbackManagementService";
import emailNotificationService from "./emailNotificationService";
import errorAlert from "./error-alert";
import documentToHtmlService from "./documentToHtmlService";


export default [
  ...resource,
  ...feedbackManagementService,
  ...emailNotificationService,
  ...errorAlert,
  ...documentToHtmlService,
];
