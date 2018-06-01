package com.younetco.test;

/**
 * Created by namnv on 10/19/14.
 */
public class MenuItem{

    public String label = "";
    public String menu= "activity";
    public String img  =  "";
    public String type  = "item";
    public String icon = "";


    /**
     * default constructor
     */
    public MenuItem(){

    }

    public MenuItem(String type, String label, String menu, String img, String icon){
        this.type = type;
        this.label = label;
        this.img  = img;
        this.menu = menu;
        this.icon = icon;
    }

    static public MenuItem getFirstMenuitem(){
        return new MenuItem("header", "Profile Name", "viewer", "", "");
    }
}
