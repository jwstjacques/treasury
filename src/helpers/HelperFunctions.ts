import moment from "moment";

export default class HelperFunctions {
  /**
   * Validates that a date string conforms to YYYY-MM-DD format.
   * s
   * @param {string} date
   * @returns {boolean}
   */
  public static validateDate(date: string): boolean {
    const regex = /^(20)\d\d-(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;

    return regex.test(date);
  }

  /**
   * Validates that an endDate is on or after a startdate.
   * To remove timestamp issues, dates are in YYYY-MM-DD format, and code handles
   * end of day timeStamp.
   *
   * @param {string} startDate
   * @param {string} endDate
   * @returns {boolean}
   */
  public static validateDateRange(startDate: string, endDate: string): boolean {
    return (
      HelperFunctions.validateDate(startDate) &&
      HelperFunctions.validateDate(startDate) &&
      (startDate === endDate || moment(startDate).isBefore(endDate))
    );
  }
}
