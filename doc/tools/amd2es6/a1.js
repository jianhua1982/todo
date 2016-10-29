/**
 * Created by cup on 9/7/16.
 */

define(['path/to/a', 'path/to/b'], function (a, b) {
    return function (x) {
        return a(b(x));
    };
});