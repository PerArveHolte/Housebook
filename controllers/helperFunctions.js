/**
 * ref: http://stackoverflow.com/questions/13142968/deep-comparison-of-objects-arrays
 */

module.exports = {
    objectsAreTheSame: function (o1, o2) {
        if (!o1)
            console.log("!o1");
        if (!o2)
            console.log("!o2");

        if ((!o1 && o2) || (o1 && !o2))
            return false;
        
        if (!o1 && !o2)
            return true;
        
        var i,
                keysO = Object.keys(o1).sort(),
                keysP = Object.keys(o2).sort();
        if (keysO.length !== keysP.length)
            return false;//not the same nr of keys
        if (keysO.join('') !== keysP.join(''))
            return false;//different keys
        for (i = 0; i < keysO.length; ++i)
        {
            if (o1[keysO[i]] instanceof Array)
            {
                if (!(o2[keysO[i]] instanceof Array))
                    return false;
                //if (compareObjects(o[keysO[i]], p[keysO[i]] === false) return false
                //would work, too, and perhaps is a better fit, still, this is easy, too
                if (o1[keysO[i]].sort().join('') !== o2[keysO[i]].sort().join(''))
                    return false;
            } else if (o1[keysO[i]] instanceof Date)
            {
                if (!(o2[keysO[i]] instanceof Date))
                    return false;
                if (('' + o1[keysO[i]]) !== ('' + o2[keysO[i]]))
                    return false;
            } else if (o1[keysO[i]] instanceof Function)
            {
                if (!(o2[keysO[i]] instanceof Function))
                    return false;
                //ignore functions, or check them regardless?
            } else if (o1[keysO[i]] instanceof Object)
            {
                if (!(o2[keysO[i]] instanceof Object))
                    return false;
                if (o1[keysO[i]] === o1)
                {//self reference?
                    if (o2[keysO[i]] !== o2)
                        return false;
                } else if (compareObjects(o1[keysO[i]], o2[keysO[i]]) === false)
                    return false;//WARNING: does not deal with circular refs other than ^^
            }
            if (o1[keysO[i]] !== o2[keysO[i]])//change !== to != for loose comparison
                return false;//not the same value
        }
        return true;
    }
};