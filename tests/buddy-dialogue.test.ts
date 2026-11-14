import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buddyLine,savedBuddyMoment} from '../lib/buddy-dialogue';
import {DESK_PRESETS,readPreferences,BUDDIES} from '../lib/workspace';
import {type Work} from '../lib/work';
const work:Work=JSON.parse(readFileSync('tests/fixtures/checklist-workflow.json','utf8'));
test('buddy encouragement is original static dialogue; accomplishments require saved transitions',()=>{for(const buddy of BUDDIES){assert.notEqual(buddyLine(buddy,'idle',0),buddyLine(buddy,'idle',1));for(const moment of ['resume','source','note','requirement','evidence','citation'] as const)assert.ok(buddyLine(buddy,moment).length>10);}assert.equal(savedBuddyMoment(work,work),'idle');assert.equal(savedBuddyMoment({...work,saved:[]},work),'source');const a=work.assignments[0];assert.equal(savedBuddyMoment(work,{...work,assignments:[{...a,research:{notes:[{id:'note',source:work.saved[0],text:'Synthetic finding',category:'Key Finding',stance:'contextual',updatedAt:'2026-11-12T00:00:00.000Z'}],groups:[],reading:{}}}]}),'note');assert.equal(savedBuddyMoment(work,{...work,assignments:[{...a,research:{notes:[],groups:[{id:'group',name:'Methods'}],reading:{}}}]}),'evidence');});
test('coordinated presets and new preferences round-trip; invalid options do not corrupt legacy preferences',()=>{for(const preset of Object.values(DESK_PRESETS))assert.deepEqual(readPreferences({getItem:()=>JSON.stringify(preset)},'key'),preset);assert.deepEqual(readPreferences({getItem:()=>JSON.stringify({theme:'bookish',density:'compact',pattern:'invalid',muteBuddy:'yes',widgetOrder:'anything'})},'key'),{theme:'bookish',density:'compact'});});
