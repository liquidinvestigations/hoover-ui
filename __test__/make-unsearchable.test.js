import makeUnsearchable from '../utils/make-unsearchable';

it('injects hidden elements but leave <mark> elements intact', () => {
    expect(makeUnsearchable('foo')).toEqual(
        'f<span class="no-find">S</span>o<span class="no-find">S</span>o<span class="no-find">S</span>'
    );

    expect(makeUnsearchable('foo <mark>b</mark>')).toEqual(
        'f<span class="no-find">S</span>o<span class="no-find">S</span>o<span class="no-find">S</span> <mark><span class="no-find">S</span>b<span class="no-find">S</span></mark><span class="no-find">S</span>'
    );
});
