import resource from "./resource";
import feedbackManagementService from "./feedbackManagementService";
import emailNotificationService from "./emailNotificationService";
import errorAlert from "./error-alert";
import documentToHtmlService from "./documentToHtmlService";
import downloadUrl from "./download-url";

export default [
  ...resource,
  ...feedbackManagementService,
  ...emailNotificationService,
  ...errorAlert,
  ...documentToHtmlService,
  ...downloadUrl,
];
