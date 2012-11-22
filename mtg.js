/* Number of different ways to form a set of k items
 * from another set of n items, without replacement. The
 * same items arranged in a different order are not
 * counted as a new permutation.
*/
function binomial(n, k) {
  if (k > n)
    return 0;

  bc = new Array();
  for (var i=0; i<k+1; i++) {
    bc[i] = 1;
  }

  for (var j=1; j<n-k+1; j++) {
    for (var i=1; i<k+1; i++) {
      bc[i] = bc[i-1]+bc[i];
    }
  }

  return bc[k];
}

/**
 * Calculates probability of drawing a given card exactly X times,
 * where that card has 'num_copies' copies in the deck.
 */
function drawCard(deck_size, hand_size, num_copies, x) {
  // Cards remaining in the deck that are not a copy of our desired card.
  var remaining_cards = deck_size - num_copies;

  return binomial(num_copies, x) * (binomial(remaining_cards, hand_size - x) / binomial(deck_size, hand_size));
}

/** Calculates probability of drawing a given card at least x times,
 * where that card has 'num_copies' copies in the deck.
 */
function drawAtLeast(deck_size, hand_size, num_copies, x) {
  var p = 0;
  var max_times = Math.min(num_copies, hand_size);

  for (var i=x ; i<=max_times ; i++) {
    p += drawCard(deck_size, hand_size, num_copies, i);
  }

  return p;
}

/* Computes all the different ways
 * that objects from can be grouped
 * into 'k' buckets. 'minimums' and 'maximums' indicate
 * the minimum and maximum number of items of a particular
 * type that can be used in the grouping.
 * For example, suppose our grouping restrictions are:
 *
 * There must be at least 2 objects of type A, at least
 * one object of type B, and at least one object of type C.
 * minimums = [2, 1, 1]
 *
 * There must be no more than 2 objects of type A.
 * There is no maximum number for the other types.
 * maximums = [2, undefined, undefined]
 *
 * We have 5 buckets in which to group all the objects.
 * k = 5.
 *
 * The output will be an array of arrays:
 * [[2, 1, 2], [2, 2, 1]]
 *
 * Each element in each subarray indicates how
 * many slots an object of that type should occupy.
 * For example, [2, 1, 2] means "two slots are
 * filled by type A, one slot is filled by type B,
 * and two slots are filled by type C". Notice that
 * the sum of all items in each subarray is equal
 * to k. The number of different types is taken to
 * be the length of the 'minimums' array.
 */
function composition(minimums, maximums, k) {
  var counter = new Array(minimums.length);
  for (var i=0; i<counter.length; i++) {
    counter[i] = 0;
  }

  return composition2(minimums, maximums, counter, 0, k, []);
}

function composition2(minimums, maximums, counter, i, k, result) {
  if (i >= counter.length) {
    var sum = 0;
    counter.forEach(function(x) { sum += x; });

    if (sum == k) {
      result.push(counter.slice(0));
    }

    return;
  }

  var max = (maximums[i] == undefined) ? k : maximums[i];
  for (var x=minimums[i]; x <= Math.min(k,max); x++) {
    counter[i] = x;
    composition2(minimums, maximums, counter, i+1, k, result);
  }

  return result;
}

/*
 * Calculates the probability of certain cards appearing in
 * a hand of size 'hand_size'.
 * 'cards' is an array of numbers representing quantities of
 * different card types.
 * 'minimums' and 'maximums' are arrays representing the minimum
 * and maximum number of each type of card that can appear in the hand.
 * 'hand_size' is the number of cards in the hand.
 *
 * Deck size is taken to be the sum of all the elements of 'cards'
 *
 * Example:
 * We have 25 mountains, 4 Searing Spears (converted mana cost of 2),
 * and 60-25-4 = 31 other cards. What is the probability
 * of having at least one Searing Spear, plus at least two
 * mountains (needed to cast Searing Spear) in your opening hand?
 *
 * 25 Mountains, 4 Searing Spears, 31 other cards
 * cards = [25, 4, 31]
 *
 * We need at least two mountains, at least one searing spear,
 * and zero or more other cards. i.e. We allow hands that contain
 * 5 mountains and two Searing Spears.
 * minimums = [2, 1, 0]
 *
 * There are no maximum restrictions. If we don't pass a value for
 * 'maximums', then the maximum number of a particular type of
 * card is taken to be the number of available cards of that
 * particular type.
 * minimums = undefined
 *
 * Starting hands have 7 cards.
 * hand_size = 7
 *
 */
function hand_probability(cards, hand_size, minimums, maximums) {
  cards = cards[0] || [cards];

  var deck_size = 0;
  cards.forEach(function(x) { deck_size += x; });

  var combinations = hand_combinations([cards], hand_size, minimums, maximums);
  return combinations / binomial(deck_size, hand_size);
}

/* Same as hand_probability, except just returns total number of
 * desired combinations, before it's been divided by the total
 * number of possible combinations.
 */
function hand_combinations(cards, hand_size, minimums, maximums) {
  // Need to change this if arguments come in as a
  // vertical, as opposed to horizontal, range from
  // the spreadsheet.
  cards = cards[0] || [cards];
  maximums = maximums || [];
  maximums = maximums[0];
  minimums = minimums || [];
  minimums = minimums[0];

  if (maximums == undefined) {
    maximums = new Array(cards.length);
  }
  if (minimums == undefined) {
    minimums = new Array(cards.length);
  }

  // Minimums default to 0
  for (var i=0 ; i<minimums.length ;i++) {
    if (minimums[i] == undefined) {
      minimums[i] = 0;
    }
  }
  // Maximums for a card type default to
  // the total number of cards of that type
  for (var i=0 ; i<maximums.length ;i++) {
    if (maximums[i] == undefined) {
      maximums[i] = cards[i];
    }
  }

  var ksum = 0;
  composition(minimums, maximums, hand_size).forEach(function(c) {
    var product = 1;
    c.forEach(function(k, idx) {
      product *= binomial(cards[idx], k);
    });
    ksum += product;
  });

  return ksum;
}

