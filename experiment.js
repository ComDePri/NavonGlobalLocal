/* ************************************ */
/* Define new helper functions for ComDepRi */
/* ************************************ */

var problemsJSON = {
  "11": [
    [2, 1, 3],
    [0, 0],
    [0]
  ],
  "12": [
    [2, 1, 0],
    [0, 0],
    [3]
  ],
  "13": [
    [2, 1, 0],
    [3, 0],
    [0]
  ],
  "14": [
    [2, 0, 0],
    [3, 1],
    [0]
  ],
  "15": [
    [2, 0, 0],
    [3, 0],
    [1]
  ],
  "16": [
    [0, 0, 0],
    [3, 2],
    [1]
  ],
  "21": [
    [2, 3, 1],
    [0, 0],
    [0]
  ],
  "22": [
    [2, 3, 0],
    [0, 0],
    [1]
  ],
  "23": [
    [2, 3, 0],
    [1, 0],
    [0]
  ],
  "24": [
    [2, 0, 0],
    [1, 3],
    [0]
  ],
  "25": [
    [2, 0, 0],
    [1, 0],
    [3]
  ],
  "26": [
    [0, 0, 0],
    [1, 2],
    [3]
  ],
  "31": [
    [3, 2, 1],
    [0, 0],
    [0]
  ],
  "32": [
    [3, 2, 0],
    [0, 0],
    [1]
  ],
  "33": [
    [3, 2, 0],
    [1, 0],
    [0]
  ],
  "34": [
    [3, 0, 0],
    [1, 2],
    [0]
  ],
  "35": [
    [3, 0, 0],
    [1, 0],
    [2]
  ],
  "36": [
    [0, 0, 0],
    [1, 3],
    [2]
  ],
  "41": [
    [3, 1, 2],
    [0, 0],
    [0]
  ],
  "42": [
    [3, 1, 0],
    [0, 0],
    [2]
  ],
  "43": [
    [3, 1, 0],
    [2, 0],
    [0]
  ],
  "44": [
    [3, 0, 0],
    [2, 1],
    [0]
  ],
  "45": [
    [3, 0, 0],
    [2, 0],
    [1]
  ],
  "46": [
    [0, 0, 0],
    [2, 3],
    [1]
  ],

  "51": [
    [1, 3, 2],
    [0, 0],
    [0]
  ],
  "52": [
    [1, 3, 0],
    [0, 0],
    [2]
  ],
  "53": [
    [2, 3, 0],
    [1, 0],
    [0]
  ],
  "54": [
    [1, 0, 0],
    [2, 3],
    [0]
  ],
  "55": [
    [1, 0, 0],
    [2, 0],
    [3]
  ],
  "56": [
    [0, 0, 0],
    [2, 1],
    [3]
  ],

  "61": [
    [1, 2, 3],
    [0, 0],
    [0]
  ],
  "62": [
    [1, 2, 0],
    [0, 0],
    [3]
  ],
  "63": [
    [2, 1, 0],
    [3, 0],
    [0]
  ],
  "64": [
    [1, 0, 0],
    [3, 2],
    [0]
  ],
  "65": [
    [1, 0, 0],
    [3, 0],
    [2]
  ],
  "66": [
    [0, 0, 0],
    [3, 1],
    [2]
  ]
}

const BUCKET_NAME = "tower-of-london-experiment-2024"
function getProlificId(){
  const urlParams = new URL(location.href).searchParams;
// Get parameters by name
  return urlParams.get('PROLIFIC_PID')
}

function getExpURL(){
  const urlParams = new URL(location.href).searchParams;

// Get parameters by name
  //console.log("getting expUrl")
  let expurl =  urlParams.get('expUrl');
  let pid = urlParams.get('PROLIFIC_PID');
  let stud = urlParams.get('studID');
  let sess = urlParams.get('sessID');
  return expurl +"/?PROLIFIC_PID="+ pid + "&studID=" + stud + "&sessID=" + sess;
}

function saveData() {
  // Retrieve data from jsPsych

  //let subject = getUrlDetails()
  let subject = getProlificId();
  var data = jsPsych.data.dataAsJSON();// Get data as JSON string

  // Make a POST request to the Lambda function or API Gateway endpoint
  $.ajax({
    url: 'https://hss74dd1ed.execute-api.us-east-1.amazonaws.com/dev/',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      "subject_id": `${subject}`,
      "bucket": `${BUCKET_NAME}`,
      "exp_data": JSON.stringify(data)
    }),
    success: function(response) {
      console.log('Data uploaded successfully:', response);
    },
    error: function(xhr, status, error) {
      console.error('Error uploading data:', error);
    }
  });
}


/* ************************************ */
/* Define helper functions */
/* ************************************ */
function evalAttentionChecks() {
  var check_percent = 1
  if (run_attention_checks) {
    var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
    var checks_passed = 0
    for (var i = 0; i < attention_check_trials.length; i++) {
      if (attention_check_trials[i].correct === true) {
        checks_passed += 1
      }
    }
    check_percent = checks_passed / attention_check_trials.length
  }
  return check_percent
}

function assessPerformance() {
	/* Function to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. */
	var experiment_data = jsPsych.data.getTrialsOfType('poldrack-single-stim')
	experiment_data = experiment_data.concat(jsPsych.data.getTrialsOfType('poldrack-categorize'))
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	for (var k = 0; k < choices.length; k++) {
		choice_counts[choices[k]] = 0
	}
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].possible_responses != 'none') {
			trial_count += 1
			rt = experiment_data[i].rt
			key = experiment_data[i].key_press
			choice_counts[key] += 1
			if (rt == -1) {
				missed_count += 1
			} else {
				rt_array.push(rt)
			}
		}
	}
	//calculate average rt
	var avg_rt = -1
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} 
	//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.85) {
			responses_ok = false
		}
	})
	var missed_percent = missed_count/trial_count
	credit_var = (missed_percent < 0.4 && avg_rt > 200 && responses_ok)
	jsPsych.data.addDataToLastTrial({"credit_var": credit_var})
}

var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}

function correct_response(trial_index, stim_index) {
  if( (trial_index === 'global' && stim_index === 0) ||
      (trial_index === 'global' && stim_index === 1) ||
      (trial_index === 'local' && stim_index === 0)  ||
      (trial_index === 'local' && stim_index === 2)) {
    return 83
  } else {
    return 72}
}

var makeTrialList = function(trial_index, len, stim, data) {
  //choice array: numeric key codes for the numbers 1-4
  console.log(stim)
  var responses ={'global': [83, 82, 72, 72], 'local': [83,72, 82, 72]}
    //create test array
  output_list = []
    //randomize first trial
  tmpi = Math.floor(Math.random() * (stim.length))
  var tmp_obj = {}
  tmp_obj.stimulus = stim[tmpi]
  var tmp_data = $.extend({}, data[tmpi])
  tmp_data.switch = 0
  tmp_data.correct_response = responses[trial_index][tmpi]
  tmp_obj.data = tmp_data
  output_list.push(tmp_obj)
    /* randomly sample from either the global or local stimulus lists (first and half part of the stim/data arrays)
	On stay trials randomly select an additional stimulus from that array. On switch trials choose from the other list. */
  for (i = 1; i < len; i++) {
    tmp_obj = {}
    tmpi = Math.floor(Math.random() * (stim.length))
    tmp_obj.stimulus = stim[tmpi]
    tmp_data = $.extend({}, data[tmpi])
    tmp_data.correct_response = correct_response(trial_index, tmpi)
    tmp_obj.data = tmp_data
    output_list.push(tmp_obj)
    console.log(trial_index + ", tmpi:" + tmpi + ", stim:" + tmp_obj.stimulus+ ", currect:" + tmp_data.correct_response)
  }
  return output_list
}


var getInstructFeedback = function() {
    return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
      '</p></div>'
  }
  

  /* ************************************ */
  /* Define experimental variables */
  /* ************************************ */
  // generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.65
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = true

// task specific variables
var current_trial = 0
var choices = [72, 83]
var task_colors = jsPsych.randomization.shuffle(['black'])
var global_shapes = ['s','h']
var local_shapes = ['s','h']
var path = 'images/'
var prefix = '<div class = centerbox><img src = "'
var postfix = '"</img></div>'
var stim = []
var data = []
var images = []
for (c = 0; c < task_colors.length; c++) {
  if (c === 0) {
    condition = 'global'
    global_shape_length = 2
    local_shape_length = 2
  } else {
    condition = 'local'
    global_shape_length = 2
    local_shape_length = 2
  }
  for (g = 0; g < global_shape_length; g++) {
    for (l = 0; l < local_shape_length; l++) {
      stim.push(prefix + path + task_colors[c] + '_' + global_shapes[g] + '_of_' + local_shapes[l] +
        '.png' + postfix)
      images.push(path + task_colors[c] + '_' + global_shapes[g] + '_of_' + local_shapes[l] +
        '.png')
      data.push({
        condition: condition,
        global_shape: global_shapes[g],
        local_shape: local_shapes[l]
      })
      console.log('data: ' + data)

    }
  }
}

console.log('sitm_list' + stim)
console.log('data: ' + data)

jsPsych.pluginAPI.preloadImages(images)
//Set up experiment stimulus order
var global_practice_trials = makeTrialList('global',16, stim, data)  //36
for (i = 0; i < global_practice_trials.length; i++) {
  global_practice_trials[i].key_answer = global_practice_trials[i].data.correct_response
}

var local_practice_trials = makeTrialList('local',16, stim, data)  //36
for (i = 0; i < local_practice_trials.length; i++) {
  local_practice_trials[i].key_answer = local_practice_trials[i].data.correct_response
}

var num_trials
if(getProlificId() === "test"){
  num_trials = 0;
} else {
  num_trials = 72
}

var global_test_trials = makeTrialList('global',num_trials, stim, data) //96
var local_test_trials = makeTrialList('local',num_trials, stim, data) //96


/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
  type: 'attention-check',
  data: {
    trial_id: "attention_check"
  },
  timing_response: 180000,
  response_ends_trial: true,
  timing_post_trial: 200
}

var attention_node = {
  timeline: [attention_check_block],
  conditional_function: function() {
    return run_attention_checks
  }
}

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60]
};

/* define static blocks */
var end_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "end",
    exp_id: 'local_global_letter'
  },
  timing_response: 180000,
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
  cont_key: [13],
  timing_post_trial: 0,
  on_finish: function() {
    assessPerformance();
    saveData();
    console.log("data_saved")
    window.location.href = getExpURL();
    history.pushState(null, '', window.location.href);
  }
};

var feedback_instruct_text =
  'Welcome to the experiment. This experiment will take about 8 minutes. Press <strong>enter</strong> to begin.'
var feedback_instruct_block = {
  type: 'poldrack-text',
  cont_key: [13],
  data: {
    trial_id: "instruction"
  },
  text: getInstructFeedback,
  timing_post_trial: 0,
  timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  data: {
    trial_id: "instruction"
  },
  pages: [
    '<div class = centerbox><p class = block-text>In this experiment you will see blue or black letters made up of smaller letters, like the image below. All of the smaller letters will always be the same letter.</p><div class = instructionImgBox><img src = "images/black_s_of_h.png" height = 200 width = 200></img></div></div>',
    '<div class = centerbox><p class = block-text>Your task is to indicate whether the larger or smaller letters is an "H" or "S", depending on the color. If the letter is ' +
    task_colors[0] + ' indicate whether the larger letter is an "H" or "S". If the letter is ' +
    task_colors[1] +
    ' indicate whether the smaller letter is an "H" or "S".</p><p class = block-text>Use the "H" or "S" keys to indicate the letter.</p></div>',
    '<div class = centerbox><p class = block-text>For instance, for the letter below you would press "S" because it is ' +
    task_colors[0] +
    ' which means you should respond based on the smaller shapes. If the shape was instead ' +
    task_colors[0] +
    ' you would press "H".</p><div class = instructionImgBox><img src = "images/' +
    task_colors[0] + '_h_of_s.png" height = 200 width = 200></img></div></div>'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};


var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],
  /* This function defines stopping criteria */
  loop_function: function(data) {
    for (i = 0; i < data.length; i++) {
      if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
        rt = data[i].rt
        sumInstructTime = sumInstructTime + rt
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
      return true
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Done with instructions. Press <strong>enter</strong> to continue.'
      return false
    }
  }
}

var start_global_practice_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "practice_intro"
  },
  text: '<div class = centerbox><p class = center-block-text>We will start with some practice. Choose the Global letter During practice you will get feedback about whether you responded correctly. You will not get feedback during the rest of the experiment.</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 1000
};

var start_local_practice_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "practice_intro"
  },
  text: '<div class = centerbox><p class = center-block-text>We will start with some practice. Choose the Local Letter. During practice you will get feedback about whether you responded correctly. You will not get feedback during the rest of the experiment.</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 1000
};

var start_local_test_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "test_intro"
  },
  text: '<div class = centerbox><p class = center-block-text>We will now start the test. Local Block description'
      + '</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 1000,
  on_finish: function() {
  	current_trial = 0
  }
};

var start_global_test_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "test_intro"
  },
  text: '<div class = centerbox><p class = center-block-text>We will now start the test. Global Block description'
      + '</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 1000,
  on_finish: function() {
    current_trial = 0
  }
};
var practice_trials = global_practice_trials;
/* define practice block */
function getPracticeBlock(trials){

  var practice_block = {
    type: 'poldrack-categorize',
    timeline: trials,
    is_html: true,
    data: {
      trial_id: "stim",
      exp_stage: "practice"
    },
    correct_text: '<div class = centerbox><div style="color:green"; class = center-text>Correct!</div></div>',
    incorrect_text: '<div class = centerbox><div style="color:red"; class = center-text>Incorrect</div></div>',
    timeout_message: '<div class = centerbox><div class = center-text>Respond faster!</div></div>',
    choices: choices,
    timing_feedback_duration: 1000,
    show_stim_with_feedback: false,
    timing_response: 2000,
    timing_post_trial: 500,
    on_finish: function (data) {
      jsPsych.data.addDataToLastTrial({
        trial_num: current_trial
      })
      current_trial += 1
    }
 }
  return practice_block;
}

/* define test block */
var global_test_block = {
  type: 'poldrack-single-stim',
  timeline: global_test_trials,
  data: {
    trial_id: "stim",
    exp_stage: "test"
  },
  is_html: true,
  choices: choices,
  timing_post_trial: 500,
  timing_response: 2000,
  on_finish: function(data) {
  	correct = false
    if (data.key_press === data.correct_response) {
      correct = true
    }
  	jsPsych.data.addDataToLastTrial({
  		correct: correct,
  		trial_num: current_trial
  	})
  	current_trial += 1
  }
};

/* define test block */
var local_test_block = {
  type: 'poldrack-single-stim',
  timeline: local_test_trials,
  data: {
    trial_id: "stim",
    exp_stage: "test"
  },
  is_html: true,
  choices: choices,
  timing_post_trial: 500,
  timing_response: 2000,
  on_finish: function(data) {
    correct = false
    if (data.key_press === data.correct_response) {
      correct = true
    }
    jsPsych.data.addDataToLastTrial({
      correct: correct,
      trial_num: current_trial
    })
    current_trial += 1
  }
};

const random_order = Math.random() < 0.5 ? 0 : 1;

/* create experiment definition array */
var local_global_letter_experiment = [];
local_global_letter_experiment.push(instruction_node);
local_global_letter_experiment.push(start_local_practice_block);
local_global_letter_experiment.push(getPracticeBlock(local_practice_trials));
local_global_letter_experiment.push(start_global_practice_block);
local_global_letter_experiment.push(getPracticeBlock(global_practice_trials));

const globalFirstSequence = [start_global_test_block, global_test_block,
                             start_local_test_block, local_test_block,];

const localFirstSequence = [start_local_test_block, local_test_block,
                              start_global_test_block, global_test_block,];

local_global_letter_experiment.push(...(random_order === 0 ? globalFirstSequence : localFirstSequence));
local_global_letter_experiment.push(attention_node)
local_global_letter_experiment.push(post_task_block)
local_global_letter_experiment.push(end_block);
