class StringUtils {
    /**
     * Capitalizes the first letter of a string.
     * @param {string} str 
     * @returns {string}
     */
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Converts a string to camelCase.
     * @param {string} str 
     * @returns {string}
     */
    static toCamelCase(str) {
        if (!str) return '';
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
            .replace(/\s+/g, '');
    }

    /**
     * Truncates a string to a specified length and adds an ellipsis.
     * @param {string} str 
     * @param {number} length 
     * @returns {string}
     */
    static truncate(str, length = 30) {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.slice(0, length) + '...';
    }

    /**
     * Checks if a string is null, undefined, or empty (including whitespace).
     * @param {string} str 
     * @returns {boolean}
     */
    static isEmpty(str) {
        return (!str || str.trim().length === 0);
    }

    static normalizeCode(code) {
        if (!code) return '';
        return String(code).replace(/\s/g, '').toLowerCase();
    }

    /**
     * Converts a string to Title Case.
     * @param {string} str
     * @returns {string}
     */
    static toTitleCase(str) {
        if (!str) return '';
        return str.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    /**
     * Converts a string to kebab-case.
     * @param {string} str
     * @returns {string}
     */
    static toKebabCase(str) {
        if (!str) return '';
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
    }

    /**
     * Converts a string to snake_case.
     * @param {string} str
     * @returns {string}
     */
    static toSnakeCase(str) {
        if (!str) return '';
        return str
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/[\s-]+/g, '_')
            .toLowerCase();
    }

    /**
     * Generates a random alphanumeric string.
     * @param {number} length
     * @returns {string}
     */
    static generateRandomString(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Extracts the file extension from a filename.
     * @param {string} filename
     * @returns {string}
     */
    static getFileExtension(filename) {
        if (!filename) return '';
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    }

    /**
     * Cleans a string to be safe for use as a filename.
     * @param {string} str
     * @returns {string}
     */
    static cleanFilename(str) {
        if (!str) return '';
        return str.replace(/[^a-z0-9_\-\.]/gi, '_');
    }

    /**
     * Removes HTML tags from a string.
     * @param {string} str
     * @returns {string}
     */
    static stripHtmlTags(str) {
        if (!str) return '';
        return str.replace(/<[^>]*>?/gm, '');
    }

    /**
     * Checks if a string represents a valid number.
     * @param {string} str
     * @returns {boolean}
     */
    static isNumeric(str) {
        if (typeof str !== "string") return false;
        return !isNaN(str) && !isNaN(parseFloat(str));
    }

    /**
     * Escapes special characters for use in a regular expression.
     * @param {string} str
     * @returns {string}
     */
    static escapeRegExp(str) {
        if (!str) return '';
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

export default StringUtils;