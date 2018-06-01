/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package com.younetco.test;

import android.app.Activity;
import android.content.res.Configuration;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.*;
import com.jeremyfeinstein.slidingmenu.lib.SlidingMenu;
import com.younetco.app.Container;
import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by namnv on 10/18/14.
 */
public class MainActivity extends CordovaActivity
{
    static final String TAG = "yn/Main";
    private int curMenuActive = -1;
    CordovaWebView myWebView;
    SlidingMenu slidingMenu;
    ListView leftSidebar;
    SidebarMenuAdapter sidebarAdapter;

    int leftActivePosition = 1;
    public Activity getActivity(){
        return this;
    }

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        super.init();

        slidingMenu =  new SlidingMenu(this);

        slidingMenu.setTouchModeAbove(SlidingMenu.TOUCHMODE_MARGIN);
        slidingMenu.setShadowWidthRes(com.younetco.test.R.dimen.shadow_width);
        slidingMenu.setShadowDrawable(R.drawable.shadow);
        slidingMenu.setBehindWidthRes(R.dimen.behind_width);
        slidingMenu.setFadeDegree(0.35f);

        slidingMenu.attachToActivity(this, SlidingMenu.SLIDING_CONTENT);
        slidingMenu.setMenu(R.layout.sidebar_frame);

        slidingMenu.setSlidingEnabled(false);


        createLeftSidebar();

        // Set by <content src="index.html" /> in config.xml
        super.loadUrl(Config.getStartUrl());

//        setContentView(R.layout.main);

        Container.getInstance().mainActivity =  this;
        Container.getInstance().slidingMenu =  slidingMenu;
        Container.getInstance().cordovaWebView =  myWebView;

        afterCreateWebView();
    }
    public void setActivePosition(int position)
    {
        Log.d(TAG, "set active position " + position);
        if(position < 0){
            leftSidebar.setItemChecked(leftActivePosition, true);
        }else{
            leftActivePosition =  position;
            leftSidebar.setItemChecked(position, true);
        }
    }

    public void lockMenu(){
        Log.d(TAG, "lock menu");
        slidingMenu.setSlidingEnabled(false);
    }

    public void unlockMenu(){
        Log.d(TAG, "unlock menu");
        slidingMenu.setSlidingEnabled(true);
    }

    /**
     *
     * @param newConfig
     */
    @Override
    public void onConfigurationChanged(Configuration newConfig){
        Log.d(TAG, "onConfigurationChanged");
        super.onConfigurationChanged(newConfig);
        slidingMenu.setBehindWidthRes(R.dimen.behind_width);
    }

    public void afterCreateWebView(){

        slidingMenu.setOnCloseListener(new SlidingMenu.OnCloseListener() {
            @Override
            public void onClose() {
//                myWebView.setSlidingMenuIsOpen(false);
            }
        });

        slidingMenu.setOnOpenListener(new SlidingMenu.OnOpenListener() {
            @Override
            public void onOpen() {
//                myWebView.setSlidingMenuIsOpen(true);
            }
        });
    }

    public void createLeftSidebar(){
        final ListView leftSidebar =  (ListView) findViewById(R.id.sidebar_items);

        final SidebarMenuAdapter adapter = new SidebarMenuAdapter(getActivity());


        Log.d(TAG, "create left side bar");

        leftSidebar.setAdapter(adapter);

        adapter.clear();
        leftSidebar.setSelector(R.drawable.sidebar_list_selector);

        adapter.add(MenuItem.getFirstMenuitem());

        leftSidebar.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int position, long l) {
//                Log.d(TAG, "click on item " + position);
                MenuItem item = adapter.getItem(position);
                if(item.menu.equals("")){
                    toggleLeftSidebar();
                    setActivePosition(curMenuActive);
                    return;
                }
                else {
                    toggleLeftSidebar();
                    onSideBarMenuClick(item.menu);
                }
                if (item.menu.equals("language") || item.menu.equals("logout")) {
                    setActivePosition(-1);
                } else {
                    curMenuActive = position;
                    setActivePosition(position);
                }
//                adapter.setActiveItem(view);
            }
        });

//        leftSidebar.setChoiceMode(ListView.CHOICE_MODE_SINGLE);

        this.leftSidebar = leftSidebar;
        this.sidebarAdapter = adapter;
    }

    public void activeSidebarItem(String itemName){

//        Log.d(TAG, "set active position " + itemName);
//        this.sidebarAdapter.setActiveItem(itemName);
    }


    public void onSideBarMenuClick(String menu){
        Log.d(TAG, "changed menu " + menu);
        appView.hideCustomView();
        appView.loadUrl(String.format("javascript:window.onSideBarMenuClick('%s');", menu));
//        myWebView.loadUrl("javascript:window.onSideBarMenuClick('"+menu+"')");
    }

    public void toggleLeftSidebar(){
        if ( slidingMenu.isMenuShowing()) {
            slidingMenu.toggle();
        }
    }

    /**
     * back pressed
     */
    @Override
    public void onBackPressed(){
        if(slidingMenu.isMenuShowing()){
            slidingMenu.toggle();
        }else{
            super.onBackPressed();
        }
    }


    /**
     * call from non-ui thread
     */
    public void updateMenuViewer(){
        ListView leftSidebar  = (ListView) findViewById(R.id.sidebar_items);
        SidebarMenuAdapter adapter = (SidebarMenuAdapter) leftSidebar.getAdapter();

        try{
            if(this.jsonObjectMenuViewer.has("img")){
                adapter.getItem(0).img= this.jsonObjectMenuViewer.getString("img");
            }
            if(this.jsonObjectMenuViewer.has("label")){
                adapter.getItem(0).label = this.jsonObjectMenuViewer.getString("label");
            }

            adapter.notifyDataSetChanged();

        }catch(JSONException ex){
            Log.d(TAG, ex.getMessage());
        }
    }

    public void setJsonArrayMenuItems(JSONArray jsonArrayMenuItems) {
        this.jsonArrayMenuItems = jsonArrayMenuItems;
    }

    /**
     * need to run from none-ui thread
     */
    private JSONArray jsonArrayMenuItems;


    private JSONObject jsonObjectMenuViewer;

    public void setJsonObjectMenuViewer(JSONObject jsonObjectMenuViewer) {
        this.jsonObjectMenuViewer = jsonObjectMenuViewer;
    }

    public void updateMenuItems(){
        Log.d(TAG, "main activity update menu items");
        int itemLength = this.jsonArrayMenuItems.length();
        int firstMenu = 1;
        ListView leftSidebar  = (ListView) findViewById(R.id.sidebar_items);
        SidebarMenuAdapter adapter = (SidebarMenuAdapter) leftSidebar.getAdapter();

        /**
         * clear items but offset 0.
         */
        while(adapter.getCount() > 1){
            adapter.remove(adapter.getItem(1));
        }

        try{
            for(int i =0; i<itemLength; ++i){
                JSONObject jsonItem  = this.jsonArrayMenuItems.getJSONObject(i);

                Log.d(TAG, "create menuItem from json "+ jsonItem.toString());

                MenuItem menuItem  = new MenuItem();

                if(jsonItem.has("img")){
                    menuItem.img  = jsonItem.getString("img");
                }

                if(jsonItem.has("menu")){
                    menuItem.menu = jsonItem.getString("menu");
                    if(menuItem.menu.equals("activity")){
                        firstMenu = i + 1;
                    }
                }

                if(jsonItem.has("label")){
                    menuItem.label = jsonItem.getString("label");
                }

                if(jsonItem.has("icon")){
                    menuItem.icon = jsonItem.getString("icon");
                }

                if(jsonItem.has("type")){
                    menuItem.type = jsonItem.getString("type");
                }

                adapter.add(menuItem);
            }

        }catch(JSONException ex){
            Log.d(TAG, "menu item error "+ex.getMessage());
        }

        setActivePosition(firstMenu);
        // reset menu item
//        adapter.notifyDataSetChanged();
    }

    public void toggleMenu() {

        slidingMenu.toggle();
    }
}
